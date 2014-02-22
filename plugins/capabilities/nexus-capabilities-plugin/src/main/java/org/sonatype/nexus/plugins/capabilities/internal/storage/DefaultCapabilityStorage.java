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

package org.sonatype.nexus.plugins.capabilities.internal.storage;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;

import org.sonatype.nexus.plugins.capabilities.CapabilityIdentity;
import org.sonatype.sisu.goodies.lifecycle.LifecycleSupport;

import com.google.common.collect.Maps;
import io.kazuki.v0.internal.v2schema.Attribute;
import io.kazuki.v0.internal.v2schema.Schema;
import io.kazuki.v0.store.KazukiException;
import io.kazuki.v0.store.Key;
import io.kazuki.v0.store.keyvalue.KeyValueIterable;
import io.kazuki.v0.store.keyvalue.KeyValuePair;
import io.kazuki.v0.store.keyvalue.KeyValueStore;
import io.kazuki.v0.store.schema.SchemaStore;
import io.kazuki.v0.store.schema.TypeValidation;

import static com.google.common.base.Preconditions.checkNotNull;

/**
 * Handles persistence of capabilities configuration.
 */
@Singleton
@Named
public class DefaultCapabilityStorage
    extends LifecycleSupport
    implements CapabilityStorage
{
  public static final String CAPABILITY_SCHEMA = "capability";

  private final KeyValueStore keyValueStore;

  private final SchemaStore schemaStore;

  @Inject
  public DefaultCapabilityStorage(final @Named("nexuscapability") KeyValueStore keyValueStore,
                                  final @Named("nexuscapability") SchemaStore schemaStore)
  {
    this.keyValueStore = checkNotNull(keyValueStore);
    this.schemaStore = checkNotNull(schemaStore);
  }

  @Override
  protected void doStart() throws Exception {
    if (schemaStore.retrieveSchema(CAPABILITY_SCHEMA) == null) {
      Schema schema = new Schema(Collections.<Attribute>emptyList());

      log.info("Creating schema for 'capability' type");

      schemaStore.createSchema(CAPABILITY_SCHEMA, schema);
    }
  }

  @Override
  public CapabilityIdentity add(final CapabilityStorageItem item) throws IOException {
    try {
      return asCapabilityIdentity(
          keyValueStore.create(CAPABILITY_SCHEMA, CapabilityStorageItem.class, item, TypeValidation.STRICT)
      );
    }
    catch (KazukiException e) {
      throw new IOException("Capability could not be added", e);
    }
  }

  @Override
  public boolean update(final CapabilityIdentity id, final CapabilityStorageItem item) throws IOException {
    try {
      return keyValueStore.update(asKey(id), CapabilityStorageItem.class, item);
    }
    catch (KazukiException e) {
      throw new IOException("Capability could not be updated", e);
    }
  }

  @Override
  public boolean remove(final CapabilityIdentity id) throws IOException {
    try {
      return keyValueStore.delete(asKey(id));
    }
    catch (KazukiException e) {
      throw new IOException("Capability could not be removed", e);
    }
  }

  @Override
  public Map<CapabilityIdentity, CapabilityStorageItem> getAll() throws IOException {
    Map<CapabilityIdentity, CapabilityStorageItem> items = Maps.newHashMap();

    try (KeyValueIterable<KeyValuePair<CapabilityStorageItem>> entries = keyValueStore.iterators().entries(
        CAPABILITY_SCHEMA, CapabilityStorageItem.class
    )) {
      for (KeyValuePair<CapabilityStorageItem> entry : entries) {
        items.put(asCapabilityIdentity(entry.getKey()), entry.getValue());
      }
    }

    return items;
  }

  private Key asKey(final CapabilityIdentity id) {
    return keyValueStore.toKey("@" + CAPABILITY_SCHEMA + ":" + id.toString());
  }

  private CapabilityIdentity asCapabilityIdentity(final Key key) {
    return new CapabilityIdentity(key.getIdPart());
  }

}
