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
 * An **{@link Ext.form.action.DirectSubmit}** that sends the json object as param to form.api.update function.
 *
 * The main reason it exists is to circumvent {@link Ext.form.action.DirectSubmit} bug that on submit will submit form
 * values as it would had been using a formHandler = true, instead of calling using the json object.
 *
 * @since 2.8
 */
Ext.define('NX.ext.form.action.DirectUpdate', {
  extend: 'Ext.form.action.DirectSubmit',
  alias: 'formaction.directupdate',

  type: 'directupdate',

  doSubmit: function () {
    var me = this,
        form = me.form,
        api = form.api,
        fn = api.update,
        callback = Ext.Function.bind(me.onComplete, me),
        formInfo = me.buildForm(),
        options;

    if (!Ext.isFunction(fn)) {
      //<debug>
      var fnName = fn;
      //</debug>

      api.update = fn = Ext.direct.Manager.parseMethod(fn);
      me.cleanup(formInfo);

      //<debug>
      if (!Ext.isFunction(fn)) {
        Ext.Error.raise('Cannot resolve Ext.Direct API method ' + fnName);
      }
      //</debug>
    }

    if (me.timeout || form.timeout) {
      options = {
        timeout: me.timeout * 1000 || form.timeout * 1000
      };
    }

    fn.call(window, form.getFieldValues(), callback, me, options);
    me.cleanup(formInfo);
  }

});
