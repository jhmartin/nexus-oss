/**
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

package org.sonatype.nexus.coreui

import groovy.transform.ToString
import org.sonatype.nexus.extdirect.model.Password

/**
 * Repository Proxy exchange object.
 *
 * @since 2.8
 */
@ToString(includePackage = false, includeNames = true)
class RepositoryProxyXO
extends RepositoryXO
{
  String proxyMode
  String remoteStatus
  String remoteStatusReason
  String remoteStorageUrl
  Boolean useTrustStoreForRemoteStorageUrl
  Boolean autoBlockActive
  Boolean fileTypeValidation
  Boolean authEnabled
  String authUsername
  Password authPassword
  String authNtlmHost
  String authNtlmDomain
  Boolean httpRequestSettings
  String userAgentCustomisation
  String urlParameters
  Integer timeout
  Integer retries
  Integer notFoundCacheTTL
  Integer itemMaxAge
}
