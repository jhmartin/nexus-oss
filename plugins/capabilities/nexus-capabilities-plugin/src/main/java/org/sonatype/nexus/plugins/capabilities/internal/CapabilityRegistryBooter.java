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

package org.sonatype.nexus.plugins.capabilities.internal;

import javax.inject.Inject;
import javax.inject.Named;

import org.sonatype.nexus.plugins.capabilities.internal.storage.CapabilityStorageConverter;
import org.sonatype.nexus.plugins.capabilities.internal.storage.DefaultCapabilityStorage;
import org.sonatype.nexus.proxy.events.NexusInitializedEvent;
import org.sonatype.nexus.proxy.events.NexusStoppingEvent;
import org.sonatype.sisu.goodies.eventbus.EventBus;

import com.google.common.eventbus.Subscribe;
import com.google.inject.Provider;
import org.eclipse.sisu.EagerSingleton;

import static com.google.common.base.Preconditions.checkNotNull;

/**
 * Loads configuration when Nexus is initialized.
 *
 * @since capabilities 2.0
 */
@Named
@EagerSingleton
public class CapabilityRegistryBooter
{
  private final Provider<DefaultCapabilityRegistry> capabilityRegistry;

  private final DefaultCapabilityStorage capabilityStorage;

  private final CapabilityStorageConverter storageConverter;

  @Inject
  public CapabilityRegistryBooter(final Provider<DefaultCapabilityRegistry> capabilityRegistry,
                                  final DefaultCapabilityStorage capabilityStorage,
                                  final EventBus eventBus,
                                  final CapabilityStorageConverter storageConverter)
  {
    this.capabilityRegistry = capabilityRegistry;
    this.capabilityStorage = checkNotNull(capabilityStorage);
    this.storageConverter = checkNotNull(storageConverter);
    checkNotNull(eventBus).register(this);
  }

  @Subscribe
  public void handle(final NexusInitializedEvent event) {
    try {
      capabilityStorage.start();
      storageConverter.convertToKazukiIfNecessary();
      capabilityRegistry.get().load();
    }
    catch (final Exception e) {
      throw new Error("Could not boot capabilities", e);
    }
  }

  @Subscribe
  public void handle(final NexusStoppingEvent event) {
    try {
      capabilityStorage.stop();
    }
    catch (final Exception e) {
      throw new RuntimeException("Could not shutdown", e);
    }
  }

  @Override
  public String toString() {
    return "Load capabilities from persistence store when Nexus is initialized";
  }

}
