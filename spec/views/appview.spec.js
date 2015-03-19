describe("App View", function() {
	var appView;
	
	beforeEach(function() {
		appView = new AppView();
	});

	afterEach(function() {
		delete appView;
	});

	describe("when instantiated", function() {
		it("is valid view", function() {
			expect(appView).toBeDefined();
		});
	});
});