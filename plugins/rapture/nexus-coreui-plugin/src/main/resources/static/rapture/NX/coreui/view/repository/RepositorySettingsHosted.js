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
Ext.define('NX.coreui.view.repository.RepositorySettingsHosted', {
  extend: 'NX.coreui.view.repository.RepositorySettings',
  alias: 'widget.nx-repository-settings-hosted',

  api: {
    submit: 'NX.direct.coreui_Repository.updateHosted'
  },

  initComponent: function () {
    var me = this;

    me.items = [
      {
        xtype: 'combo',
        name: 'writePolicy',
        fieldLabel: 'Deployment Policy',
        emptyText: 'select a policy',
        editable: false,
        store: [
          ['ALLOW_WRITE', 'Allow Redeploy'],
          ['ALLOW_WRITE_ONCE', 'Disable Redeploy'],
          ['READ_ONLY', 'Read Only']
        ],
        queryMode: 'local'
      },
      {
        xtype: 'checkbox',
        name: 'browseable',
        fieldLabel: 'Allow file browsing',
        value: true
      },
      {
        xtype: 'checkbox',
        name: 'exposed',
        fieldLabel: 'Publish URL',
        value: true
      }
    ];

    me.callParent(arguments);
  }

});
