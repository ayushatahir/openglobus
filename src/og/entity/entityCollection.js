goog.provide('og.EntityCollection');


goog.require('og.BillboardHandler');

/*
 * og.EntityCollection
 *
 *
 */
og.EntityCollection = function () {
    this._renderNodeIndex = -1;
    this.renderNode = null;
    this.visibility = true;
    this._billboardHandler = new og.BillboardHandler(this);
    //...

    this.entities = [];
};

og.EntityCollection.prototype.setVisibility = function (visibility) {
    this.visibility = visibility;
};

og.EntityCollection.prototype._addRecursively = function (entity) {

    //billboard
    this._billboardHandler.add(entity.billboard);

    //label
    //this._labelHandler.add(entity.label);

    for (var i = 0; i < entity.childrenNodes.length; i++) {
        entity.childrenNodes[i]._entityCollection = this;
        entity.childrenNodes[i]._entityCollectionIndex = entity._entityCollectionIndex;
        this._addRecursively(entity.childrenNodes[i]);
    }
};

og.EntityCollection.prototype.add = function (entity) {
    if (!entity._entityCollection) {
        entity._entityCollection = this;
        entity._entityCollectionIndex = this.entities.length;
        this.entities.push(entity);
        this._addRecursively(entity);
    }
    return this;
};

og.EntityCollection.prototype.belongs = function (entity) {
    return (entity._entityCollection && this._renderNodeIndex == entity._entityCollection._renderNodeIndex);
};

og.EntityCollection.prototype._removeRecursively = function (entity) {
    entity._entityCollection = null;
    entity._entityCollectionIndex = -1;

    //billboard
    this._billboardHandler.remove(entity.billboard);

    //label
    //this._labelHandler.remove(entity.label);

    for (var i = 0; i < entity.childrenNodes.length; i++) {
        this._removeRecursively(entity.childrenNodes[i]);
    }
};

og.EntityCollection.prototype.removeEntity = function (entity) {
    entity._entityCollection = null;
    this.entities.splice(entity._entityCollectionIndex, 1);
    this.reindexEntitiesArray(entity._entityCollectionIndex);
    entity._entityCollectionIndex = -1;

    if (this.belongs(entity)) {
        this._removeRecursively(entity);
    }
};

og.BillboardHandler.prototype.reindexEntitiesArray = function (startIndex) {
    var e = this.entities;
    for (var i = startIndex; i < e.length; i++) {
        e[i]._entityCollectionIndex = i;
    }
};

//og.EntityCollection.prototype.forEach = function (callback, autoRefresh) {
//    this._billboardHandler.forEach(callback);
//    if (autoRefresh) {
//        this._billboardHandler.refresh();
//    }
//};

og.EntityCollection.prototype.addTo = function (renderNode) {
    if (!this.renderNode) {
        this._renderNodeIndex = renderNode.entityCollections.length;
        this.renderNode = renderNode;
        renderNode.entityCollections.push(this);
        this._billboardHandler.setRenderer(renderNode.renderer);
        this.updateBillboardsTextureAtlas();
    }
    return this;
};

og.EntityCollection.prototype.updateBillboardsTextureAtlas = function () {
    var b = this._billboardHandler._billboards;
    for (var i = 0; i < b.length; i++) {
        b[i].setSrc(b[i].src);
    }
};

og.EntityCollection.prototype.remove = function () {
    if (this.renderNode) {
        this.renderNode.billboardCollection.splice(this._renderNodeIndex, 1);
        this.renderNode = null;
        this._renderNodeIndex = -1;
        for (var i = this._renderNodeIndex; i < this.renderNode.entityCollections.length; i++) {
            this.renderNode.entityCollections._renderNodeIndex = i;
        }
    }
};

//og.EntityCollection.prototype.draw = function () {
//    var s = this._billboardHandler,
//        a = this._alignedAxisBillboardsHandler;

//    if (this.visibility && (s._billboards.length || a._billboards.length)) {
//        var rn = this.renderNode
//        var gl = rn.renderer.handler.gl;
//        gl.disable(gl.CULL_FACE);

//        gl.activeTexture(gl.TEXTURE0);
//        gl.bindTexture(gl.TEXTURE_2D, rn.billboardsTextureAtlas.texture);

//        s.draw();
//        a.draw();

//        gl.enable(gl.CULL_FACE);
//    }
//};

og.EntityCollection.prototype.clear = function () {
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].remove();
    }
};