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
Ext.define('NX.coreui.controller.SecurityRealms', {
  extend: 'Ext.app.Controller',
  mixins: {
    logAware: 'NX.LogAware'
  },

  views: [
    'security.SecurityRealms'
  ],

  stores: [
    'RealmType'
  ],

  refs: [
    { ref: 'settings', selector: 'nx-coreui-security-realms' }
  ],

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.getApplication().getIconController().addIcons({
      'feature-security-realms': {
        file: 'shield.png',
        variants: ['x16', 'x32']
      }
    });

    me.getApplication().getFeaturesController().registerFeature({
      mode: 'admin',
      path: '/Security/Realms',
      view: { xtype: 'nx-coreui-security-realms' },
      visible: function () {
        return NX.Permissions.check('nexus:settings', 'read');
      }
    });

    me.listen({
      controller: {
        '#Refresh': {
          refresh: me.loadRealmType
        }
      },
      component: {
        'nx-coreui-security-realms': {
          beforerender: me.loadRealmType
        }
      }
    });
  },

  loadRealmType: function () {
    var me = this,
        settings = me.getSettings();

    if (settings) {
      me.getRealmTypeStore().load();
    }
  }

});