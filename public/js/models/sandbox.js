chorus.models.Sandbox = chorus.models.Base.extend({
    constructorName: "Sandbox",
    attrToLabel: {
        "instanceName": "instances.dialog.instance_name",
        "databaseName": "instances.dialog.database_name",
        "schemaName": "instances.dialog.schema_name",
        "size": "instances.dialog.size"
    },

    urlTemplate: function(options) {
        var method = options && options.method;
        if (method === "update" || method === "delete") {
            return "workspace/{{workspaceId}}/sandbox/{{id}}";
        } else {
            return "workspace/{{workspaceId}}/sandbox";
        }
    },

    beforeSave: function(attrs) {
        var type = _.map(['instance', 'database', 'schema'], function(name) {
            return attrs[name] ? "0" : "1";
        });
        if (attrs.schemaName && attrs.schemaName === chorus.models.Schema.DEFAULT_NAME) {
            type[2] = "0";
        }
        attrs.type = type.join("");
    },

    declareValidations: function(attrs) {
        if (this.isCreatingNew("instance", attrs)) {
            this.require("instanceName", attrs);
            this.requirePattern("instanceName", chorus.ValidationRegexes.ChorusIdentifier(), attrs);
            this.require("size", attrs);

            if (this.maximumSize) {
                this.requireIntegerRange("size", 1, this.maximumSize, attrs);
            } else {
                this.requirePositiveInteger("size", attrs);
            }
        }
        if (this.isCreatingNew('database', attrs)) {
            this.require("databaseName", attrs);
            this.requirePattern("databaseName", chorus.ValidationRegexes.ChorusIdentifier(), attrs);
            this.require("schemaName", attrs);
            this.requirePattern("schemaName", chorus.ValidationRegexes.ChorusIdentifier(), attrs);
        }
        if (this.isCreatingNew('schema', attrs)) {
            this.require("schemaName", attrs);
            this.requirePattern("schemaName", chorus.ValidationRegexes.ChorusIdentifier(), attrs);
        }
    },

    isCreatingNew: function(type, attrs) {
        return !this.get(type) && !attrs[type];
    },

    schema: function() {
        this._schema = this._schema || new chorus.models.Schema({
            id: this.get("schemaId"),
            name: this.get("schemaName"),
            databaseId: this.get("databaseId"),
            databaseName: this.get("databaseName"),
            instanceId: this.get("instanceId"),
            instanceName: this.get("instanceName")
        });

        return this._schema;
    },

    instance: function() {
        this._instance = this._instance || new chorus.models.Instance({
            id: this.get("instanceId"),
            name: this.get("instanceName")
        });
        return this._instance;
    },

    database: function() {
        this._database = this._database || new chorus.models.Database({
            id: this.get("databaseId"),
            name: this.get("databaseName"),
            instanceId: this.get("instanceId"),
            instanceName: this.get("instanceName")
        });

        return this._database;
    },

    canonicalName: function() {
        return this.schema().canonicalName();
    }
});
