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
Ext.define('NX.controller.MasterDetail', {
  extend: 'Ext.app.Controller',
  requires: [
    'NX.Permissions',

    // many impls use this
    'NX.view.info.Panel',
    'NX.view.info.Entry'
  ],

  mixins: {
    logAware: 'NX.LogAware'
  },

  permission: undefined,

  init: function () {
    var me = this,
        store = me.stores[0],
        componentListener = {},
        storeListener = {};

    componentListener[me.list] = {
      beforerender: me.loadStores,
      afterrender: me.applyPermissions,
      selectionchange: me.onSelectionChange,
      selection: me.onSelection
    };
    componentListener[me.list + ' ^ nx-masterdetail-panel nx-masterdetail-tabs > tabpanel'] = {
      tabchange: me.bookmark
    };
    storeListener['#' + store] = {
      load: me.onStoreLoad
    };

    me.listen({
      component: componentListener,
      store: storeListener
    });
    me.listen({
      controller: {
        '#User': {
          permissionschanged: me.applyPermissions
        },
        '#Bookmarking': {
          navigate: me.navigateTo
        },
        '#Refresh': {
          refresh: me.onRefresh
        }
      }
    });

    if (me.icons) {
      me.getApplication().getIconController().addIcons(me.icons);
    }
    if (me.features) {
      me.getApplication().getFeaturesController().registerFeature(me.features);
    }
  },

  onSelection: Ext.emptyFn,

  onPermissionsChanged: Ext.emptyFn,

  getDescription: Ext.emptyFn,

  onRefresh: function () {
    var me = this,
        list = me.getList();

    if (list) {
      me.loadStores();
    }
  },

  loadStores: function () {
    var me = this;

    Ext.each(me.stores, function (store) {
      me.getApplication().getStore(store).load();
    });
  },

  loadStoresAndSelect: function (id) {
    var me = this,
        list = me.getList(),
        store = list.getStore();

    if (id) {
      store.on('load', function (store) {
        list.getSelectionModel().select(store.getById(id));
      }, me, { single: true });
    }

    me.loadStores();
  },

  onStoreLoad: function () {
    var me = this,
        list = me.getList();

    if (list) {
      me.navigateTo(NX.Bookmarks.getBookmark());
    }
  },

  reselect: function () {
    var me = this,
        list = me.getList(),
        selected = list.getSelectionModel().getSelection();

    if (selected.length) {
      me.onModelChanged(selected[0]);
    }
  },

  onSelectionChange: function (selectionModel, selected) {
    var me = this;

    me.onModelChanged(selected[0]);
    me.bookmark();
  },

  onModelChanged: function (model) {
    var me = this,
        list = me.getList(),
        tabs = list.up('nx-masterdetail-panel').down('nx-masterdetail-tabs');

    if (model) {
      tabs.show();
      list.getView().focusRow(model);
      tabs.setDescription(me.getDescription(model));
    }
    else {
      tabs.hide();
      tabs.setDescription('Empty selection');
    }

    me.enableDeleteButton();

    me.getList().fireEvent('selection', me.getList(), model);
  },

  applyPermissions: function () {
    var me = this,
        list = me.getList();

    if (list) {
      me.enableNewButton();
      me.enableDeleteButton();
      me.onPermissionsChanged();
    }
  },

  shouldEnableNewButton: function () {
    var me = this;
    if (me.permission) {
      return NX.Permissions.check(me.permission, 'create')
    }
    return true;
  },

  enableNewButton: function () {
    var me = this,
        list = me.getList(),
        button;

    if (list) {
      button = list.down('button[action=new]');
      if (button) {
        if (me.shouldEnableNewButton()) {
          button.enable();
        }
        else {
          button.disable();
        }
      }
    }
  },

  shouldEnableDeleteButton: function () {
    var me = this;
    if (me.permission) {
      return NX.Permissions.check(me.permission, 'delete')
    }
    return true;
  },

  enableDeleteButton: function () {
    var me = this,
        list = me.getList(),
        selectedModels, button;

    if (list) {
      selectedModels = list.getSelectionModel().getSelection();
      button = list.down('button[action=delete]');
      if (button) {
        if (selectedModels.length > 0 && me.shouldEnableDeleteButton()) {
          button.enable();
        }
        else {
          button.disable();
        }
      }
    }
  },

  /**
   * Bookmark current selected model / selected tab.
   */
  bookmark: function () {
    var me = this,
        list = me.getList(),
        selected = list.getSelectionModel().getSelection(),
        tabs = list.up('nx-masterdetail-panel').down('nx-masterdetail-tabs'),
        bookmark = me.getApplication().getMenuController().getBookmark(),
        segments = [],
        model, idBookmark, selectedTabBookmark;

    if (selected.length) {
      model = selected[0];
      idBookmark = model.getId();
      if (idBookmark) {
        if (NX.Bookmarks.encode(idBookmark) != idBookmark.toLowerCase()) {
          idBookmark = NX.Bookmarks.encode(idBookmark);
        }
        segments.push(idBookmark);
        selectedTabBookmark = tabs.getBookmarkOfSelectedTab();
        if (selectedTabBookmark) {
          segments.push(selectedTabBookmark);
        }
        NX.Bookmarks.bookmark(bookmark.appendSegments(segments), me);
      }
    }
    else {
      NX.Bookmarks.bookmark(bookmark, me);
    }
  },

  /**
   * @public
   * @param {NX.Bookmark} bookmark to navigate to
   */
  navigateTo: function (bookmark) {
    var me = this,
        list = me.getList(),
        store, modelId, tabBookmark, model, tabs;

    if (list && bookmark) {
      modelId = bookmark.getSegment(1);
      tabBookmark = bookmark.getSegment(2);
      if (modelId) {
        me.logDebug('Navigate to: ' + modelId + (tabBookmark ? ":" + tabBookmark : ''));
        store = list.getStore();
        model = store.getById(modelId);
        // lets try to see if we can find the record by encoded value
        // TODO review this as it can be a performance penalty
        // Maybe we should ass a marker that the bookmark was encoded and only search in that case
        if (!model) {
          model = store.getAt(store.findBy(function(model){
             return NX.Bookmarks.encode(model.getId()) === modelId;
          }));
        }
        if (model) {
          list.getSelectionModel().select(model, false, true);
          list.getView().focusRow(model);
          me.onModelChanged(model);
        }
        if (tabBookmark) {
          list.up('nx-masterdetail-panel').down('nx-masterdetail-tabs').setActiveTabByBookmark(tabBookmark);
        }
      }
      else {
        list.getSelectionModel().deselectAll();
      }
    }
  }

});