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
 * Base form panel.
 *
 * @since 2.8
 */
Ext.define('NX.view.SettingsForm', {
  extend: 'Ext.form.Panel',
  alias: 'widget.nx-settingsform',

  bodyPadding: 10,
  autoScroll: true,

  defaults: {
    xtype: 'textfield',
    allowBlank: false
  },

  buttonAlign: 'left',

  buttons: [
    { text: 'Save', formBind: true, action: 'save', ui: 'primary' },
    { text: 'Discard',
      handler: function () {
        var form = this.up('form'),
            record = form.getRecord();

        if (record) {
          form.loadRecord(record);
        }
        else if (form.api && form.api.load) {
          form.load();
        }
        else {
          form.getForm().reset();
        }
      }
    }
  ]

});
