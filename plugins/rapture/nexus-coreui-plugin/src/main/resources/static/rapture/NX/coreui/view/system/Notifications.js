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
Ext.define('NX.coreui.view.system.Notifications', {
  extend: 'NX.view.SettingsPanel',
  alias: 'widget.nx-coreui-system-notifications',

  items: [
    {
      xtype: 'nx-settingsform',
      settingsForm: true,
      settingsFormTitle: 'General system settings',
      items: [
        {
          xtype: 'label',
          html: '<p>E-mail notifications.</p>'
        },
        {
          xtype: 'nx-email',
          name: 'systemEmail',
          fieldLabel: 'System E-mail'
        },
        {
          xtype: 'checkbox',
          fieldLabel: 'Enable E-mail notifications'
        },

        // TODO: additional notification addresses and role configuration

        {
          xtype: 'label',
          html: '<p>SMTP settings.</p>'
        },
        {
          xtype: 'textfield',
          name: 'host',
          fieldLabel: 'Host'
        },
        {
          xtype: 'numberfield',
          name: 'port',
          fieldLabel: 'port'
        },
        {
          xtype: 'textfield',
          name: 'username',
          allowBlank: true,
          fieldLabel: 'Username'
        },
        {
          xtype: 'textfield',
          name: 'password',
          fieldLabel: 'Password',
          allowBlank: true,
          inputType: 'password'
        },
        {
          xtype: 'combo',
          name: 'connection',
          fieldLabel: 'Connection',
          emptyText: 'select a connection type',
          editable: false,
          store: [
            ['PLAIN', 'Use plain SMTP'],
            ['SSL', 'Use plain SMTP (SSL)'],
            ['TLS', 'Use STARTTLS negotiation (TLS)']
          ],
          queryMode: 'local'
        }

        // TODO: mode plain/ssl/tls

        // TODO: test button
      ]
    }
  ]

});