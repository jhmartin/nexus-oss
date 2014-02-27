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
Ext.define('NX.view.Login', {
  extend: 'Ext.window.Window',
  alias: 'widget.nx-login',

  title: 'Login',

  layout: 'fit',
  autoShow: true,
  modal: true,
  constrain: true,
  width: 320,
  defaultFocus: 'username',

  /**
   * @protected
   */
  initComponent: function () {
    var me = this;

    Ext.apply(this, {
      items: {
        xtype: 'form',
        bodyPadding: 10,
        defaultType: 'textfield',
        defaults: {
          labelWidth: 100,
          anchor: '100%'
        },
        items: [
          {
            name: 'username',
            itemId: 'username',
            fieldLabel: 'Username',
            emptyText: 'enter your username',
            allowBlank: false
          },
          {
            name: 'password',
            itemId: 'password',
            fieldLabel: 'Password',
            inputType: 'password',
            emptyText: 'enter your password',
            allowBlank: false
          },
          {
            xtype: 'checkbox',
            fieldLabel: 'Remember me',
            name: 'remember'
          }
        ],

        buttons: [
          { text: 'Login', action: 'login', formBind: true, ui: 'primary' },
          { text: 'Cancel', handler: me.close, scope: me }
        ]
      }
    });

    me.callParent();
  }

});
