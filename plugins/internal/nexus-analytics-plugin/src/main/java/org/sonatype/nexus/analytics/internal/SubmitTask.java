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
package org.sonatype.nexus.analytics.internal;

import javax.inject.Inject;
import javax.inject.Named;

import org.sonatype.nexus.analytics.EventExporter;
import org.sonatype.nexus.scheduling.NexusTaskSupport;

import static com.google.common.base.Preconditions.checkNotNull;

/**
 * Event submission task.
 *
 * @since 2.8
 */
@Named(SubmitTask.ID)
public class SubmitTask
  extends NexusTaskSupport
{
  // FIXME: Presently the ID *MUST* be the class.simpleName
  // FIXME: if a different value is used, the scheduling components will not work

  public static final String ID = "SubmitTask";
  //public static final String ID = AnalyticsPlugin.ID_PREFIX + ".submit";

  private final EventExporter eventExporter;

  @Inject
  public SubmitTask(final EventExporter eventExporter) {
    this.eventExporter = checkNotNull(eventExporter);
  }

  @Override
  protected String getMessage() {
    return "Submitting analytics events";
  }

  @Override
  protected void execute() throws Exception {
    // HACK: for now simply export with-out drop
    eventExporter.export(false);
  }
}
