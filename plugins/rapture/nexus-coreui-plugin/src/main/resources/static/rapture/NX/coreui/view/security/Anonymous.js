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
Ext.define('NX.coreui.view.security.Anonymous', {
  extend: 'NX.view.SettingsPanel',
  alias: 'widget.nx-coreui-security-anonymous',

  initComponent: function () {
    var me = this;

    me.items = [
      {
        xtype: 'nx-settingsform',
        settingsForm: true,
        settingsFormTitle: 'Anonymous security settings',
        api: {
          load: 'NX.direct.coreui_SecurityAnonymous.read',
          submit: 'NX.direct.coreui_SecurityAnonymous.update'
        },
        items: [
          {
            xtype: 'label',
            html: '<p>Anonymous user access settings.</p>'
          },
          {
            xtype: 'checkbox',
            name: 'enabled',
            value: true,
            boxLabel: 'Allow anonymous users to access the server',
            listeners: {
              change: me.handleUseCustomUser,
              afterrender: me.handleUseCustomUser
            }
          },
          {
            xtype: 'nx-optionalfieldset',
            title: 'Use custom anonymous user',
            itemId: 'useCustomUser',
            checkboxToggle: true,
            checkboxName: 'useCustomUser',
            collapsed: true,
            items: [
              {
                xtype: 'label',
                html: '<p>Override the default anonymous user.</p>'
              },
              {
                xtype: 'textfield',
                name: 'username',
                fieldLabel: 'Username',
                emptyText: 'anonymous',
                allowBlank: false
              },
              {
                xtype: 'nx-password',
                name: 'password',
                fieldLabel: 'Password',
                emptyText: 'password',
                allowBlank: false
              }
            ]
          },
        ]
      }
    ];

    me.callParent(arguments);
  },

  handleUseCustomUser: function (checkbox) {
    var useCustomUser = checkbox.up('form').down('#useCustomUser');

    if (checkbox.getValue()) {
      useCustomUser.enable();
    }
    else {
      useCustomUser.collapse();
      useCustomUser.disable();
    }
  }

});