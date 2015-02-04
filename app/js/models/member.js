var Member = Backbone.Model.extend({
	urlRoot: "/api/tokens",
	name: "",
    email: "", 
    image: "",
    endpointId: "",
	initialize: function() {
	}
});