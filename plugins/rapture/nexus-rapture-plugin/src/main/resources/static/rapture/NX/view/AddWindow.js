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
Ext.define('NX.view.AddWindow', {
  extend: 'Ext.window.Window',
  alias: 'widget.nx-addwindow',

  layout: 'fit',
  autoShow: true,
  modal: true,
  constrain: true,
  width: 640,

  initComponent: function () {
    var me = this;

    if (Ext.isDefined(me.items) && !Ext.isArray(me.items)) {
      if (!me.items.buttons) {
        me.items.buttons = [
          { text: 'Add', action: 'add', formBind: true, ui: 'primary' },
          { text: 'Cancel', handler: function () {
            this.up('window').close();
          }}
        ];
      }
    }

    me.callParent(arguments);
  }

});
