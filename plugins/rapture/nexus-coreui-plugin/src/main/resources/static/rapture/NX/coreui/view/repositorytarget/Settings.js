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
Ext.define('NX.coreui.view.repositorytarget.Settings', {
  extend: 'NX.view.SettingsForm',
  alias: 'widget.nx-coreui-repositorytarget-settings',

  api: {
    submit: 'NX.direct.coreui_RepositoryTarget.update'
  },

  initComponent: function () {
    var me = this;

    me.items = [
      {
        xtype: 'hiddenfield',
        name: 'id'
      },
      {
        xtype: 'textfield',
        name: 'name',
        itemId: 'name',
        fieldLabel: 'Name',
        emptyText: 'enter a target name'
      },
      {
        xtype: 'combo',
        name: 'format',
        fieldLabel: 'Repository Type',
        emptyText: 'select a repository type',
        store: 'RepositoryFormat',
        queryMode: 'local',
        displayField: 'name',
        valueField: 'id'
      },
      {
        xtype: 'nx-valueset',
        name: 'patterns',
        itemId: 'patterns',
        fieldLabel: 'Patterns',
        emptyText: 'enter a pattern expression',
        sorted: true
      }
    ];

    me.callParent(arguments);
  }

});
