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

package org.sonatype.nexus.rapture.internal.ux;

import java.util.Map;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;

import org.sonatype.nexus.ApplicationStatusSource;
import org.sonatype.nexus.SystemStatus;
import org.sonatype.nexus.extdirect.DirectComponentSupport;
import org.sonatype.security.SecuritySystem;

import com.softwarementors.extjs.djn.config.annotations.DirectAction;
import com.softwarementors.extjs.djn.config.annotations.DirectPollMethod;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.Subject;

import static com.google.common.base.Preconditions.checkNotNull;

/**
 * Status Ext.Direct component.
 *
 * @since 2.8
 */
@Named
@Singleton
@DirectAction(action = "Status")
public class StatusDirectComponent
    extends DirectComponentSupport
{

  private final ApplicationStatusSource applicationStatusSource;

  private final SecuritySystem securitySystem;

  @Inject
  public StatusDirectComponent(final ApplicationStatusSource applicationStatusSource,
                               final SecuritySystem securitySystem)
  {
    this.applicationStatusSource = checkNotNull(applicationStatusSource);
    this.securitySystem = checkNotNull(securitySystem);
  }

  @DirectPollMethod
  public StatusXO status(final Map<String, String> parameters) {
    StatusXO statusXO = new StatusXO();

    SystemStatus status = applicationStatusSource.getSystemStatus();

    statusXO.setName(status.getAppName());
    statusXO.setEdition(status.getEditionShort());
    statusXO.setVersion(status.getVersion());

    Subject subject = SecurityUtils.getSubject();

    if (securitySystem.isAnonymousAccessEnabled()) {
      statusXO.setLoggedIn(!securitySystem.getAnonymousUsername().equals(subject.getPrincipal()));
    }
    else {
      // anon access is disabled, simply ask JSecurity about this
      statusXO.setLoggedIn(subject != null && subject.isAuthenticated());
    }

    if (subject != null && statusXO.isLoggedIn()) {
      // try to set the loggedInUsername
      Object principal = subject.getPrincipal();

      if (principal != null) {
        statusXO.setLoggedInUsername(principal.toString());
      }
    }

    return statusXO;
  }

}
