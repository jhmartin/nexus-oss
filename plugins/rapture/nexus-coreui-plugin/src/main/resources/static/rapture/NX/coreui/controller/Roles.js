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

  stores: [
    'Role'
  ],
  views: [
    'role.RoleFeature',
    'role.RoleList'
  ],
  refs: [
    {
      ref: 'list',
      selector: 'nx-coreui-role-list'
    },
    {
      ref: 'info',
      selector: 'nx-coreui-role-feature nx-info-panel'
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

  getDescription: function (model) {
    return model.get('name');
  },

  onSelection: function (list, model) {
    var me = this;

    if (Ext.isDefined(model)) {
      me.getInfo().showInfo({
        'Id': model.get('id'),
        'Realm': model.get('realm'),
        'Name': model.get('name'),
        'Description': model.get('description')
      });
    }
  }

});