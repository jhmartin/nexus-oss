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
 * @since 2.8
 */
Ext.define('NX.controller.State', {
  extend: 'Ext.app.Controller',
  requires: [
    'Ext.Direct',
    'NX.Dialogs'
  ],
  mixins: {
    logAware: 'NX.LogAware'
  },

  models: [
    'State'
  ],
  stores: [
    'State'
  ],

  /**
   * @private
   */
  disconnectedTimes: 0,

  /**
   * Max number of times to show a warning, before disabling the UI.
   *
   * @private
   */
  maxDisconnectWarnings: 3,

  /**
   * @private
   * True when state is received from server.
   */
  receiving: false,

  init: function () {
    var me = this;

    me.listen({
      controller: {
        '#State': {
          uisettingschanged: me.onUiSettingsChanged,
          licensechanged: me.onLicenseChanged,
          serveridchanged: me.reloadWhenServerIdChanged
        }
      },
      store: {
        '#State': {
          add: me.onEntryAdded,
          update: me.onEntryUpdated,
          remove: me.onEntryRemoved
        }
      }
    });

    me.addEvents(
        /**
         * @event changed
         * Fires when any of application context values changes.
         */
        'changed'
    );
  },

  onLaunch: function () {
    NX.State.setBrowserSupported(
        !Ext.isIE || (Ext.isIE9p && Ext.isIE11m)
    );
    NX.State.setValue('debug', NX.app.debug);
    NX.State.setValues(NX.app.state);
  },

  /**
   * @public
   * @returns {Boolean} true when status is being received from server
   */
  isReceiving: function () {
    return this.receiving;
  },

  getValue: function (key, defaultValue) {
    var me = this,
        model = me.getStateStore().getById(key),
        value = defaultValue;

    if (model) {
      value = model.get('value');
    }
    return value;
  },

  /**
   * @public
   * @param {String} key
   * @param {Object} value
   * @param {String} [hash]
   */
  setValue: function (key, value, hash) {
    var me = this,
        model = me.getStateStore().getById(key);

    if (!model) {
      if (Ext.isDefined(value)) {
        me.getStateStore().add(me.getStateModel().create({ key: key, value: value, hash: hash }));
      }
    }
    else {
      if (Ext.isDefined(value)) {
        if (!Ext.Object.equals(value, model.get('value'))) {
          model.set('value', value);
        }
        if (!Ext.Object.equals(hash, model.get('hash'))) {
          model.set('hash', hash)
        }
      }
      else {
        me.getStateStore().remove(model);
      }
    }
    me.getStateStore().commitChanges();
    if (me.statusProvider) {
      if (Ext.isDefined(value) && hash) {
        me.statusProvider.baseParams[key] = hash;
      }
      else {
        delete me.statusProvider.baseParams[key];
      }
    }
  },

  setValues: function (map) {
    var me = this,
        hash, valueToSet;

    if (map) {
      Ext.Object.each(map, function (key, value) {
        valueToSet = value;
        if (Ext.isObject(value) && value.hash && value.value) {
          hash = value.hash;
          valueToSet = value.value;
        }
        if (valueToSet) {
          if (!Ext.isPrimitive(valueToSet) && !Ext.isArray(valueToSet)
              && Ext.ClassManager.getByAlias('nx.state.' + key)) {
            valueToSet = Ext.ClassManager.instantiateByAlias('nx.state.' + key, valueToSet);
          }
        }
        me.setValue(key, valueToSet, hash);
      });
    }
  },

  onEntryAdded: function (store, models) {
    var me = this;
    Ext.each(models, function (model) {
      me.notifyChange(model.get('key'), model.get('value'));
    });
  },

  onEntryUpdated: function (store, model, operation, modifiedFieldNames) {
    var me = this;
    if ((operation === Ext.data.Model.EDIT) && modifiedFieldNames.indexOf('value') > -1) {
      me.notifyChange(model.get('key'), model.get('value'), model.modified.value);
    }
  },

  onEntryRemoved: function (store, model) {
    var me = this;
    me.notifyChange(model.get('key'), undefined, model.get('value'));
  },

  notifyChange: function (key, value, oldValue) {
    var me = this;
    me.logDebug('Changed: ' + key + ' -> ' + (value ? Ext.JSON.encode(value) : '(deleted)'));
    me.fireEvent(key.toLowerCase() + 'changed', value, oldValue);
    me.fireEvent('changed', key, value, oldValue);
  },

  /**
   * @private
   * Reset state pooling when uiSettings.statusInterval changes.
   * @param {Object} uiSettings
   * @param {Number} uiSettings.statusInterval
   * @param {Boolean} uiSettings.debugAllowed
   * @param {String} uiSettings.title
   * @param {Object} oldUiSettings
   * @param {Number} oldUiSettings.statusInterval
   * @param {Boolean} oldUiSettings.debugAllowed
   * @param {String} oldUiSettings.title
   */
  onUiSettingsChanged: function (uiSettings, oldUiSettings) {
    var me = this;

    uiSettings = uiSettings || {};
    oldUiSettings = oldUiSettings || {};

    if (uiSettings.debugAllowed !== oldUiSettings.debugAllowed) {
      NX.State.setValue('debug', uiSettings.debugAllowed && (window.location.search === '?debug'));
    }

    if (uiSettings.title !== oldUiSettings.title) {
      document.title = document.title.replace(oldUiSettings.title, uiSettings.title);
    }

    if (uiSettings.statusInterval > 0) {
      if (!oldUiSettings || (uiSettings.statusInterval !== oldUiSettings.statusInterval)) {
        if (me.statusProvider) {
          me.statusProvider.disconnect();
          me.receiving = false;
        }
        me.statusProvider = Ext.Direct.addProvider({
          type: 'polling',
          url: NX.direct.api.POLLING_URLS.rapture_State_get,
          interval: uiSettings.statusInterval * 1000,
          baseParams: {
          },
          listeners: {
            data: me.onServerData,
            scope: me
          }
        });
        me.logDebug('State pooling configured for ' + (uiSettings.statusInterval) + ' seconds');
      }
    }
    else {
      if (me.statusProvider) {
        me.statusProvider.disconnect();
      }
      me.logDebug('State pooling disabled');
    }
  },

  /**
   * Called when there is new data from state callback.
   *
   * @private
   */
  onServerData: function (provider, event) {
    var me = this;
    if (event.data) {
      me.onSuccess(event);
    }
    else {
      me.onError(event);
    }
  },

  /**
   * @private
   * Called when state pooling was successful.
   */
  onSuccess: function (event) {
    var me = this,
        serverId = me.getValue('serverId'),
        state;

    me.receiving = true;

    // re-enable the UI we are now connected again
    if (me.disconnectedTimes > 0) {
      me.disconnectedTimes = 0;
      NX.Messages.add({text: 'Server reconnected', type: 'success' });
    }

    // propagate event data
    state = event.data.data;

    if (!me.reloadWhenServerIdChanged(serverId, state.values.serverId ? state.values.serverId.value : serverId)) {
      me.setValues(state.values);

      // fire commands if there are any
      if (state.commands) {
        Ext.each(state.commands, function (command) {
          me.fireEvent('command' + command.type.toLowerCase(), command.data);
        });
      }
    }

    // TODO: Fire global refresh event
  },

  /**
   * @private
   * Called when state pooling failed.
   */
  onError: function (event) {
    var me = this;

    if (event.code === 'xhr') {
      if (event.xhr.status === 402) {
        NX.State.setValue('license', Ext.apply(Ext.clone(NX.State.getValue('license')), { installed: false }));
      }
      else {
        me.receiving = false;

        // we appear to have lost the server connection
        me.disconnectedTimes++;
        if (me.disconnectedTimes <= me.maxDisconnectWarnings) {
          NX.Messages.add({ text: 'Server disconnected', type: 'warning' });
        }

        // Give up after a few attempts and disable the UI
        if (me.disconnectedTimes > me.maxDisconnectWarnings) {
          NX.Messages.add({text: 'Server disconnected', type: 'danger' });

          // Stop polling
          me.statusProvider.disconnect();

          // Show the UI with a modal dialog error
          NX.Dialogs.showError(
              'Server disconnected',
              'There is a problem communicating with the server',
              {
                fn: function () {
                  // retry after the dialog is dismissed
                  me.statusProvider.connect();
                }

                // FIXME: Show "Retry" as button text
                // FIXME: Get icon to show up ... stupid icons
              }
          );
        }
      }
    }
    else if (event.type === 'exception') {
      NX.Messages.add({ text: event.message, type: 'danger' });
    }
  },

  /**
   * @private
   * Show messages about license.
   * @param {Object} license
   * @param {Number} license.installed
   * @param {Object} oldLicense
   * @param {Number} oldLicense.installed
   */
  onLicenseChanged: function (license, oldLicense) {
    if (license && oldLicense) {
      if (license.installed && !oldLicense.installed) {
        NX.Messages.add({ text: 'License installed', type: 'success' });
      }
      else if (!license.installed && oldLicense.installed) {
        NX.Messages.add({ text: 'License uninstalled', type: 'warning' });
      }
    }
  },

  reloadWhenServerIdChanged: function (serverId, oldServerId) {
    if (oldServerId && (serverId !== oldServerId)) {
      NX.Dialogs.showInfo(
          'Server restarted',
          'Application will be reloaded as server has been restarted',
          {
            fn: function () {
              window.location.reload();
            }
          }
      );
      return true;
    }
    return false;
  }

});