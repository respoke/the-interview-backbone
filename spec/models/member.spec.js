describe("Member Model", function() {
	var member;
	
	beforeEach(function() {
		member = new Member();
	});

	afterEach(function() {
		delete member;
	});

	describe("when instantiated", function() {
		it("is valid member", function() {
			expect(member).to.exist;
		});

		it("has valid endpointId", function() {
			member.set({"endpointId": "tvdavis@digium.com"});
			expect(member.get("endpointId")).to.equal("tvdavis@digium.com");
		});
		
		it("urlRoot set to /api/tokens", function() {
			expect(member.urlRoot).to.equal("/api/tokens");
		});
	});
	
	describe("events", function() {
		it("should fire a callback when 'sync' is triggered", function() {
			var spy = sinon.spy();
			
			member.on("sync", spy);
			
			member.trigger("sync");
			
			expect(spy.called).to.be.true;
		});
		
		it("should fire a callback when save is executed", function() {
			var spy = sinon.spy(jQuery, 'ajax');
			
			member.set("endpointId", "tvdavis@digium.com");
			member.save();
			
			expect(spy.called).to.be.true;
			
			jQuery.ajax.restore();
		});
	});
	
	describe("respoke", function() {
		it("should call the /api/tokens to get a respoke temporary token", function() {
			var spy = sinon.spy(jQuery, 'ajax');
			
			member.set("endpointId", "tvdavis@digium.com");
			member.save();

			expect(spy.getCall(0).args[0].url).to.equal("/api/tokens");
			
			jQuery.ajax.restore();
		});
	});
});