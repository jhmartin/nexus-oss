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
Ext.define('NX.coreui.controller.Roles', {
  extend: 'NX.controller.MasterDetail',

  list: 'nx-coreui-role-list',

  models: [
    'Role'
  ],
  stores: [
    'Role',
    'RoleSource',
    'RoleBySource'
  ],
  views: [
    'role.RoleAdd',
    'role.RoleFeature',
    'role.RoleList',
    'role.RoleSettings'
  ],
  refs: [
    {
      ref: 'list',
      selector: 'nx-coreui-role-list'
    },
    {
      ref: 'settings',
      selector: 'nx-coreui-role-feature nx-coreui-role-settings'
    }
  ],
  icons: {
    'feature-security-roles': {
      file: 'user_policeman.png',
      variants: ['x16', 'x32']
    },
    'role-default': {
      file: 'user_policeman.png',
      variants: ['x16', 'x32']
    }
  },
  features: {
    path: '/Security/Roles',
    view: { xtype: 'nx-coreui-role-feature' },
    visible: function () {
      return NX.Permissions.check('security:roles', 'read');
    }
  },
  permission: 'security:roles',

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.callParent();

    me.listen({
      controller: {
        '#Refresh': {
          refresh: me.loadRoleSource
        }
      },
      store: {
        '#RoleSource': {
          load: me.onRoleSourceLoad
        }
      },
      component: {
        'nx-coreui-role-list': {
          beforerender: me.loadRoleSource
        },
        'nx-coreui-role-list menuitem[action=newrole]': {
          click: me.showAddWindowRole
        },
        'nx-coreui-role-list menuitem[action=newmapping]': {
          click: me.showAddWindowMapping
        },
        'nx-coreui-role-add button[action=add]': {
          click: me.create
        },
        'nx-coreui-role-settings button[action=save]': {
          click: me.update
        }
      }
    });
  },

  getDescription: function (model) {
    return model.get('name');
  },

  onSelection: function (list, model) {
    var me = this,
        bottomBar;

    if (Ext.isDefined(model)) {
      me.getSettings().loadRecord(model);
      bottomBar = me.getSettings().getDockedItems('toolbar[dock="bottom"]')[0];
      // TODO disable update when read only
      if (model.get('readOnly')) {
        bottomBar.hide();
      }
      else {
        bottomBar.show();
      }
    }
  },

  /**
   * @private
   */
  showAddWindowRole: function () {
    Ext.widget('nx-coreui-role-add');
  },

  /**
   * @private
   */
  showAddWindowMapping: function (menuItem) {
    var me = this;
    me.getRoleBySourceStore().load({
      params: {
        source: menuItem.source
      }
    });
    Ext.widget('nx-coreui-role-add', { source: menuItem.source });
  },

  /**
   * @private
   * (Re)load role source store.
   */
  loadRoleSource: function () {
    var me = this,
        list = me.getList();

    if (list) {
      me.getRoleSourceStore().load();
    }
  },

  /**
   * @private
   * (Re)create external role mapping entries.
   */
  onRoleSourceLoad: function (store) {
    var me = this,
        list = me.getList(),
        newButton, menuItems = [];

    if (list) {
      newButton = list.down('button[action=new]');
      if (newButton.menu.items.length > 1) {
        newButton.menu.remove(1);
      }
      store.each(function (source) {
        menuItems.push({
          text: source.get('name'),
          action: 'newmapping',
          source: source.getId()
        });
      });
      newButton.menu.add({
        text: 'External Role Mapping',
        menu: menuItems
      });
    }
  },

  /**
   * @protected
   * Enable 'Delete' when user has 'delete' permission and role is not read only.
   */
  bindDeleteButton: function (button) {
    var me = this;
    button.mon(
        NX.Conditions.and(
            NX.Conditions.isPermitted(me.permission, 'delete'),
            NX.Conditions.gridHasSelection(me.list, function (model) {
              return !model.get('readOnly');
            })
        ),
        {
          satisfied: button.enable,
          unsatisfied: button.disable,
          scope: button
        }
    );
  },

  /**
   * @private
   * Creates a new role.
   */
  create: function (button) {
    var me = this,
        win = button.up('window'),
        form = button.up('form');

    form.submit({
      waitMsg: 'Creating role...',
      success: function (form, action) {
        win.close();
        NX.Messages.add({
          text: 'Role created: ' + me.getDescription(me.getRoleModel().create(action.result.data)),
          type: 'success'
        });
        me.loadStoreAndSelect(action.result.data.id);
      }
    });
  },

  /**
   * @private
   * Updates a role.
   */
  update: function (button) {
    var me = this,
        form = button.up('form');

    form.submit({
      waitMsg: 'Updating role...',
      success: function (form, action) {
        NX.Messages.add({
          text: 'Role updated: ' + me.getDescription(me.getRoleModel().create(action.result.data)),
          type: 'success'
        });
        me.loadStore();
      }
    });
  },

  /**
   * @private
   * @override
   * Deletes a role.
   * @param model role to be deleted
   */
  deleteModel: function (model) {
    var me = this,
        description = me.getDescription(model);

    NX.direct.coreui_Role.delete(model.getId(), function (response) {
      me.loadStore();
      if (Ext.isDefined(response) && response.success) {
        NX.Messages.add({
          text: 'Role deleted: ' + description, type: 'success'
        });
      }
    });
  }

});