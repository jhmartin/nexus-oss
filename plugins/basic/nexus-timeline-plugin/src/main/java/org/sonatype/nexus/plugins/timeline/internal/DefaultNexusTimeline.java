/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2007-2013 Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */

package org.sonatype.nexus.plugins.timeline.internal;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;
import java.util.Set;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;

import org.sonatype.nexus.plugins.timeline.Entry;
import org.sonatype.nexus.plugins.timeline.NexusTimeline;
import org.sonatype.nexus.plugins.timeline.TimelineCallback;
import org.sonatype.nexus.plugins.timeline.TimelinePlugin;
import org.sonatype.nexus.proxy.events.NexusInitializedEvent;
import org.sonatype.nexus.proxy.events.NexusStoppedEvent;
import org.sonatype.sisu.goodies.eventbus.EventBus;
import org.sonatype.sisu.goodies.lifecycle.LifecycleSupport;

import com.google.common.base.Predicate;
import com.google.common.eventbus.Subscribe;
import io.kazuki.v0.internal.v2schema.Attribute;
import io.kazuki.v0.internal.v2schema.Schema;
import io.kazuki.v0.store.KazukiException;
import io.kazuki.v0.store.journal.JournalStore;
import io.kazuki.v0.store.journal.PartitionInfo;
import io.kazuki.v0.store.journal.PartitionInfoSnapshot;
import io.kazuki.v0.store.keyvalue.KeyValueIterable;
import io.kazuki.v0.store.keyvalue.KeyValuePair;
import io.kazuki.v0.store.lifecycle.Lifecycle;
import io.kazuki.v0.store.schema.SchemaStore;
import io.kazuki.v0.store.schema.TypeValidation;

import static com.google.common.base.Preconditions.checkNotNull;

/**
 * This is the "real thing": implementation backed by spice Timeline. Until now, it was in Core, but it kept many
 * important and key dependencies in core too, and making Nexus Core literally a hostage of it.
 *
 * @author cstamas
 * @since 2.0
 */
@Named
@Singleton
public class DefaultNexusTimeline
    extends LifecycleSupport
    implements NexusTimeline
{
  public static final String TIMELINE_SCHEMA = "timeline";

  private final Lifecycle lifecycle;

  private final JournalStore journalStore;

  private final SchemaStore schemaStore;

  @Inject
  public DefaultNexusTimeline(final EventBus eventBus,
                              final @Named(TimelinePlugin.ARTIFACT_ID) Lifecycle lifecycle,
                              final @Named(TimelinePlugin.ARTIFACT_ID) JournalStore journalStore,
                              final @Named(TimelinePlugin.ARTIFACT_ID) SchemaStore schemaStore)
  {
    this.lifecycle = checkNotNull(lifecycle);
    this.journalStore = checkNotNull(journalStore);
    this.schemaStore = checkNotNull(schemaStore);
    eventBus.register(this);
  }

  // EBus handlers

  @Subscribe
  public void on(final NexusInitializedEvent evt) {
    try {
      start();
    }
    catch (Exception e) {
      log.warn("Could not start timeline", e);
    }
  }

  @Subscribe
  public void on(final NexusStoppedEvent evt) {
    try {
      stop();
    }
    catch (Exception e) {
      log.warn("Could not stop timeline", e);
    }
  }

  // LifecycleSupport

  @Override
  public void doStart()
      throws IOException
  {
    log.debug("Starting Timeline...");
    try {
      lifecycle.init();
      lifecycle.start();

      // create schema if needed
      if (schemaStore.retrieveSchema(TIMELINE_SCHEMA) == null) {
        log.info("Creating schema for {} type", TIMELINE_SCHEMA);
        final Schema schema = new Schema(Collections.<Attribute>emptyList());
        schemaStore.createSchema(TIMELINE_SCHEMA, schema);
      }
      log.info("Started Timeline...");
    }
    catch (KazukiException e) {
      throw new IOException("Could not start Timeline", e);
    }
  }

  @Override
  public void doStop()
      throws IOException
  {
    log.debug("Stopping Timeline...");
    lifecycle.stop();
    lifecycle.shutdown();
    log.info("Stopped Timeline...");
  }

  // API

  @Override
  @Deprecated
  public void add(long timestamp, String type, String subType, Map<String, String> data) {
    add(new Entry(timestamp, type, subType, data));
  }

  @Override
  public void add(final Entry... records) {
    if (!isStarted()) {
      return;
    }
    try {
      for (Entry record : records) {
        journalStore.append(TIMELINE_SCHEMA, Entry.class, record, TypeValidation.STRICT);
      }
    }
    catch (KazukiException e) {
      log.warn("Failed to append a Timeline record", e);
    }
  }


  @Override
  public void retrieve(final int fromItem,
                       final int count,
                       final Set<String> types,
                       final Set<String> subTypes,
                       final Predicate<Entry> filter,
                       final TimelineCallback callback)
  {
    if (!isStarted()) {
      return;
    }
    try {
      // HACK: We need "reverse" iterator, that would iterate from last to last-count
      // element of DB...!

      // We do manual filtering here, so not passing in limit and limiting manually
      int currentCount = 0;
      try (final KeyValueIterable<KeyValuePair<Entry>> kvs = journalStore
          .entriesRelative(TIMELINE_SCHEMA, Entry.class, (long) fromItem, null)) {
        for (KeyValuePair<Entry> kv : kvs) {
          final Entry record = kv.getValue();
          if (types != null && !types.contains(record.getType())) {
            continue; // skip it
          }
          if (subTypes != null && !subTypes.contains(record.getSubType())) {
            continue; // skip it
          }
          if (filter != null && !filter.apply(record)) {
            continue; // skip it
          }
          currentCount++;
          if (count < currentCount) {
            break;
          }
          callback.processNext(record);
        }
      }
    }
    catch (IOException e) {
      log.warn("Failed to process Timeline record in callback", e);
    }
    catch (KazukiException e) {
      log.warn("Failed to iterate Timeline store", e);
    }
  }

  @Override
  public void purgeOlderThan(final int days) {
    if (!isStarted()) {
      return;
    }
    // NOTE: This is merely a hack, we need to come up with some general partitioning strategy
    // Could we partition per-day? Or just modify the semantics of the input maybe, as purge
    // was painfully needed for Lucene backed Timeline, but with Kazuki it might get non-issue?
    try {
      if (days == 0) {
        // today included, lose the current partition, so that any new events are separate from those that exist already
        journalStore.closeActivePartition();
      }
      try (KeyValueIterable<PartitionInfoSnapshot> partitions = journalStore.getAllPartitions()) {
        for (PartitionInfo partition : partitions) {
          if (!partition.isClosed()) {
            continue;
          }
          journalStore.dropPartition(partition.getPartitionId());
        }
      }
    }
    catch (KazukiException e) {
      log.warn("Failed to purge Timeline store", e);
    }
  }
}
