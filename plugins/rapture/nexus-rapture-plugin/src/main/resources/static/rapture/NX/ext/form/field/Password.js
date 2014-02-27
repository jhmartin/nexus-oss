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
 * An password **{@link Ext.form.field.Text}**.
 */
Ext.define('NX.ext.form.field.Password', {
  extend: 'Ext.form.field.Text',
  alias: 'widget.nx-password',

  requires: [
    'NX.util.Base64'
  ],

  inputType: 'password',

  getValue: function () {
    var me = this,
        value = me.callParent(arguments);

    if (value) {
      return NX.util.Base64.encode(value);
    }
    return value;
  },

  setValue: function (value) {
    var me = this;

    if (value) {
      arguments[0] = NX.util.Base64.decode(value);
    }

    return me.callParent(arguments);
  }

});
