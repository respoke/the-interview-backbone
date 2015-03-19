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
			expect(appView).to.exist;
		});
	});
	
	describe("respoke", function() {
		var client;
		
		beforeEach(function() {
			client = appView.client;
		});

		afterEach(function() {
			delete client;
		});
		
		it("client object exists", function() {
			expect(client).to.exist;
		});
		
		it("client object is of type 'respoke.Client'", function() {
			expect(client.className).to.equal('respoke.Client');
		});
		
		it("client.listen exists", function() {
			expect(typeof client.listen).to.equal('function');
		});
		
		it("client is connected", function() {
			expect(client.isConnected()).to.be.false;
		});
		
		it("client is connected", function() {
			expect(client.isConnected()).to.be.false;
		});
		
		it("should fire a callback when 'connect' is triggered", function() {
			var spy = sinon.spy();
			
			client.listen("connect", spy);
			
			client.disconnect();
			
			expect(spy.called).to.be.false;
		});
	});
});