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
 * A **{@link Ext.form.field.ComboBox}** with an extra button that allows value to be cleared.
 */
Ext.define('NX.ext.form.field.ClearableComboBox', {
  extend: 'Ext.form.field.ComboBox',
  alias: 'widget.nx-clearablecombobox',

  // TODO: Only show clear trigger if we have text
  trigger2Cls: Ext.baseCSSPrefix + 'form-clear-trigger',

  /**
   * @private
   * Clear value.
   */
  onTrigger2Click: function () {
    this.reset();
  }

});