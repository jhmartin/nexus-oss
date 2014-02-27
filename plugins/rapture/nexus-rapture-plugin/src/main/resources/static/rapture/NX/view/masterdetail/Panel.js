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
Ext.define('NX.view.masterdetail.Panel', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.nx-masterdetail-panel',

  require: [
    'NX.view.Info',
    'NX.view.InfoPanel'
  ],

  layout: 'border',

  tabs: {
    xtype: 'nx-info-panel'
  },

  initComponent: function () {
    var me = this;

    me.items = [
      {
        xtype: me.list,
        region: 'center',
        flex: 0.5,
        allowDeselect: true
      },
      {
        xtype: 'nx-masterdetail-tabs',
        region: 'south',
        split: true,
        collapsible: true,
        flex: 0.5,
        hidden: true,
        autoScroll: true, // FIXME this only works for 1 tab
        tabs: me.tabs
      }
    ];

    me.callParent(arguments);

    if (Ext.isDefined(me.iconName)) {
      me.setDescriptionIconName(me.iconName);
    }
  },

  setDescription: function (description) {
    this.down('nx-masterdetail-tabs').setDescription(description);
  },

  setDescriptionIconName: function (iconName) {
    this.down('nx-masterdetail-tabs').setIconCls(NX.Icons.cls(iconName, 'x16'));
  },

  showWarning: function (message) {
    this.down('nx-masterdetail-tabs').showWarning(message);
  },

  clearWarning: function () {
    this.down('nx-masterdetail-tabs').clearWarning();
  },

  addTab: function (tab) {
    this.down('nx-masterdetail-tabs').addTab(tab);
  }

});
