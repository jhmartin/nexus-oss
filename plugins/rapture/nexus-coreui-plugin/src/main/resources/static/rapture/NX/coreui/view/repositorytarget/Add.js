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
Ext.define('NX.coreui.view.repositorytarget.Add', {
  extend: 'Ext.window.Window',
  alias: 'widget.nx-repositorytarget-add',

  title: 'Create new target',

  layout: 'fit',
  autoShow: true,
  modal: true,
  constrain: true,
  width: 640,
  defaultFocus: 'name',

  initComponent: function () {
    var me = this;

    Ext.apply(me, {
      items: {
        xtype: 'form',
        api: {
          submit: NX.direct.RepositoryTarget.create
        },
        bodyPadding: 10,
        defaults: {
          anchor: '100%',
          htmlDecode: true
        },
        items: [
          {
            xtype: 'textfield',
            name: 'name',
            itemId: 'name',
            fieldLabel: 'Name',
            //emptyText: 'enter a target name',
            //allowBlank: false
          },
          {
            xtype: 'combo',
            name: 'contentClassId',
            fieldLabel: 'Repository Type',
            //emptyText: 'select a repository type',
            //allowBlank: false,
            store: 'ContentClass',
            queryMode: 'local',
            displayField: 'name',
            valueField: 'id'
          }
        ],

        buttons: [
          { text: 'Add', action: 'add', formBind: true, ui: 'primary' },
          { text: 'Cancel', handler: me.close, scope: me }
        ]
      }
    });

    me.callParent(arguments);
  }

});
