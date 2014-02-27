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
 * **{@link Ext.form.action.DirectSubmit}** overrides (see inline comments marked with &lt;override/&gt;
 * @see "https://support.sencha.com/index.php#ticket-16118"
 * @see "https://support.sencha.com/index.php#ticket-16102"
 *
 * @since 2.8
 */
Ext.define('NX.ext.form.action.DirectSubmit', {
  override: 'Ext.form.action.DirectSubmit',

  submitEmptyText: false,

  doSubmit: function () {
    var me = this,
        form = me.form,
        api = form.api,
        fn = api.submit,
        callback = Ext.Function.bind(me.onComplete, me),
        formInfo = me.buildForm(),
        options;

    if (!Ext.isFunction(fn)) {
      //<debug>
      var fnName = fn;
      //</debug>

      api.update = fn = Ext.direct.Manager.parseMethod(fn);
      //<override> avoid cleanup as that resets values of file upload fields
      //me.cleanup(formInfo);
      //</override>

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

    //<override> call using field values if direct function formHandler = false
    //fn.call(window, formInfo.formEl, callback, me, options);
    fn.call(window, fn.directCfg.method.formHandler ? formInfo.formEl : me.getParams(true), callback, me, options);
    //</override>
    me.cleanup(formInfo);
  }

});
