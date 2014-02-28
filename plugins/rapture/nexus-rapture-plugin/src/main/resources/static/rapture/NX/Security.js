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
 * Helpers to interact with **{@link NX.controller.User}** controller.
 *
 * @since 2.8
 */
Ext.define('NX.Security', {
  singleton: true,
  requires: [
    'NX.controller.User'
  ],

  /**
   * @private
   * @returns {NX.controller.User}
   */
  controller: function () {
    return NX.getApplication().getController('User');
  },

  /**
   * @see {@link NX.controller.User#hasUser}
   */
  hasUser: function () {
    var me = this;
    if (me.controller()) {
      return me.controller().hasUser();
    }
  },

  /**
   * @see {@link NX.controller.User#askToAuthenticate}
   */
  askToAuthenticate: function (message, options) {
    var me = this;
    if (me.controller()) {
      me.controller().askToAuthenticate(message, options);
    }
  },

  /**
   * @see {@link NX.controller.User#doWithAuthenticationToken}
   */
  doWithAuthenticationToken: function (message, options) {
    var me = this;
    if (me.controller()) {
      me.controller().doWithAuthenticationToken(message, options);
    }
  },

  /**
   * @see {@link NX.controller.User#logout}
   */
  logout: function () {
    var me = this;
    if (me.controller()) {
      me.controller().logout();
    }
  }

});