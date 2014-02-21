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

package org.sonatype.nexus.apachehttpclient;

import java.io.IOException;

import org.apache.http.HttpException;
import org.apache.http.HttpHost;
import org.apache.http.HttpRequest;
import org.apache.http.HttpRequestInterceptor;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.AuthState;
import org.apache.http.auth.Credentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.client.protocol.HttpClientContext;
import org.apache.http.impl.auth.BasicScheme;
import org.apache.http.protocol.HttpContext;

/**
 * A {@link HttpRequestInterceptor} that forces HC4 to auth preemptively, without accepting challenge, against target
 * host. Use with caution, as this might provide leak of sensitive information! Usually, this should be used to access
 * trusted but protected HTTP services (ie. internal services, within same firewall area, "in house").
 *
 * @since 2.8
 */
public class PreemptiveAuthHttpRequestInterceptor
    implements HttpRequestInterceptor
{
  @Override
  public void process(final HttpRequest request, final HttpContext context) throws HttpException, IOException {
    final HttpClientContext clientContext = HttpClientContext.adapt(context);
    final AuthState authState = clientContext.getTargetAuthState();
    if (authState.getAuthScheme() == null) {
      final CredentialsProvider credsProvider = clientContext.getCredentialsProvider();
      final HttpHost targetHost = clientContext.getTargetHost();
      final Credentials creds = credsProvider
          .getCredentials(new AuthScope(targetHost.getHostName(), targetHost.getPort()));
      if (creds != null) {
        authState.update(new BasicScheme(), creds);
      }
    }
  }
}
