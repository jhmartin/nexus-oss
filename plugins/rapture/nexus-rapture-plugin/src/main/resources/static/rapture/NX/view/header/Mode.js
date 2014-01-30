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
 * Base class for mode buttons.
 *
 * @since 2.8
 */
Ext.define('NX.view.header.Mode', {
  extend: 'Ext.button.Button',

  toggleGroup: 'mode',

  /**
   * @cfg mode Mode name
   */

  /**
   * @cfg autoHide If button should auto hide when no features are available for selected mode (default true)
   */
  autoHide: true,

  /**
   * @cfg collapseMenu If menu should be collapsed automatically when mode is selected (default true)
   */
  collapseMenu: true,

  /**
   * @override
   */
  initComponent: function () {
    var me = this;

    Ext.apply(me, { ui: 'headermode' });

    me.callSuper(arguments);
  }

});