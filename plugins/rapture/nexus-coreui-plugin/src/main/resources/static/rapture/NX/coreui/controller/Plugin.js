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
Ext.define('NX.coreui.controller.Plugin', {
  extend: 'Ext.app.Controller',
  mixins: {
    logAware: 'NX.LogAware'
  },

  views: [
    'security.Anonymous',
    'security.Realms',
    'security.UserToken',
    'system.General',
    'system.Http',
    'system.Notifications'
  ],

  /**
   * @override
   */
  init: function () {
    var me = this;

    // HACK: Show some items only if user is logged in for testing
    var visibleIfLoggedIn = function () {
      return Ext.isDefined(NX.State.getUser());
    };

    me.getApplication().getFeaturesController().registerFeature([
      // security
      {
        mode: 'admin',
        path: '/Security',
        view: 'NX.view.feature.Group',
        iconConfig: {
          file: 'security.png',
          variants: ['x16', 'x32']
        },
        weight: 90,
        visible: visibleIfLoggedIn
      },
      {
        mode: 'admin',
        path: '/Security/Anonymous',
        view: 'NX.coreui.view.security.Anonymous',
        iconConfig: {
          file: 'user_silhouette.png',
          variants: ['x16', 'x32']
        },
        visible: visibleIfLoggedIn
      },
      {
        mode: 'admin',
        path: '/Security/Realms',
        view: 'NX.coreui.view.security.Realms',
        iconConfig: {
          file: 'shield.png',
          variants: ['x16', 'x32']
        },
        visible: visibleIfLoggedIn
      },

      // system
      {
        mode: 'admin',
        path: '/System',
        view: 'NX.view.feature.Group',
        iconConfig: {
          file: 'cog.png',
          variants: ['x16', 'x32']
        },
        weight: 1000,
        visible: visibleIfLoggedIn
      },
      {
        mode: 'admin',
        path: '/System/General',
        view: 'NX.coreui.view.system.General',
        iconConfig: {
          file: 'wrench.png',
          variants: ['x16', 'x32']
        },
        visible: visibleIfLoggedIn
      },
      {
        mode: 'admin',
        path: '/System/HTTP',
        view: 'NX.coreui.view.system.Http',
        iconConfig: {
          file: 'transmit.png',
          variants: ['x16', 'x32']
        },
        visible: visibleIfLoggedIn
      },
      {
        mode: 'admin',
        path: '/System/Notifications',
        view: 'NX.coreui.view.system.Notifications',
        iconConfig: {
          file: 'emails.png',
          variants: ['x16', 'x32']
        },
        visible: visibleIfLoggedIn
      },
    ]);
  }
});