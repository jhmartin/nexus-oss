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
/**
 * Privilege controller.
 *
 * @since 2.8
 */
Ext.define('NX.coreui.controller.Privileges', {
  extend: 'NX.controller.MasterDetail',

  list: 'nx-coreui-privilege-list',

  stores: [
    'Privilege'
  ],
  views: [
    'privilege.PrivilegeFeature',
    'privilege.PrivilegeList',
    'privilege.PrivilegeAddRepositoryTarget'
  ],
  refs: [
    {
      ref: 'list',
      selector: 'nx-coreui-privilege-list'
    },
    {
      ref: 'info',
      selector: 'nx-coreui-privilege-feature nx-info-panel'
    }
  ],
  icons: {
    'feature-security-privileges': {
      file: 'medal_gold_1.png',
      variants: ['x16', 'x32']
    },
    'privilege-default': {
      file: 'medal_gold_1.png',
      variants: ['x16', 'x32']
    }
  },
  features: {
    path: '/Security/Privileges',
    view: { xtype: 'nx-coreui-privilege-feature' },
    visible: function () {
      return NX.Permissions.check('security:privileges', 'read');
    }
  },
  permission: 'security:privileges',

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.callParent();

    me.listen({
      component: {
        'nx-coreui-privilege-list menuitem[action=newrepositorytarget]': {
          click: me.showAddWindowRepositoryTarget
        },
        'nx-coreui-privilege-add-repositorytarget button[action=add]': {
          click: me.create
        },
        'nx-coreui-privilege-add-repositorytarget #repositoryId': {
          change: me.filterRepositoryTargets
        }
      }
    });
  },

  getDescription: function (model) {
    return model.get('name');
  },

  onSelection: function (list, model) {
    var me = this,
        info;

    if (Ext.isDefined(model)) {
      info = {
        'Id': model.get('id'),
        'Name': model.get('name'),
        'Description': model.get('description'),
        'Method': model.get('method')
      };
      if (model.get('repositoryTargetName')) {
        info['Repository Target'] = model.get('repositoryTargetName');
      }
      if (model.get('repositoryName')) {
        info['Repository'] = model.get('repositoryName');
      }
      me.getInfo().showInfo(info);
    }
  },

  /**
   * @private
   */
  showAddWindowRepositoryTarget: function () {
    Ext.widget('nx-coreui-privilege-add-repositorytarget');
  },

  /**
   * @private
   */
  filterRepositoryTargets: function (repositoryIdCombo) {
    repositoryIdCombo.up('form').down('#repositoryTargetId').setValue(undefined);
    repositoryIdCombo.up('window').reloadTargets(
        repositoryIdCombo.getStore().getById(repositoryIdCombo.getValue()).get('format')
    );
  },

  /**
   * @protected
   * Enable 'Delete' when user has 'delete' permission and privilege is not read only.
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
   * Creates a new privilege for a repository target.
   */
  create: function (button) {
    var me = this,
        win = button.up('window'),
        form = button.up('form');

    form.submit({
      waitMsg: 'Creating privilege...',
      success: function (form, action) {
        win.close();
        Ext.Array.each(action.result.data, function (privilege) {
          NX.Messages.add({
            text: 'Privilege created: ' + privilege.name,
            type: 'success'
          });
        });
        me.loadStoreAndSelect(action.result.data[0].id);
      }
    });
  },

  /**
   * @private
   * @override
   * Deletes a privilege.
   * @param model privilege to be deleted
   */
  deleteModel: function (model) {
    var me = this,
        description = me.getDescription(model);

    NX.direct.coreui_Privilege.delete(model.getId(), function (response) {
      me.loadStore();
      if (Ext.isDefined(response) && response.success) {
        NX.Messages.add({
          text: 'Privilege deleted: ' + description, type: 'success'
        });
      }
    });
  }

});