jQuery(document).ready(function($) {
 
var AppView = Backbone.View.extend({
	el: $("#theinterview"),
	
	initialize: function() {
		console.log("initialize app-view");
		
		var _this = this;
		
		window.sketchpad = Raphael.sketchpad("whiteboard-canvas", {
			width: "100%", //550
			height: 200, //200
			editing: true
		});
		
		respoke.log.setLevel("debug");
		
		this.client = respoke.createClient();	// instance of the Respoke Client
		
		this.endpoints = {};
		
		console.log("initialize", this);
		
		this.members = new Members();
		
		this.member = new Member();
		
		if(!this.member.has("name")) {
			console.log("get member name");
			
			$(".signin").show();
		}
		
		// Event Listeners
		this.listenTo(this.member, "sync", this.connect);
		
		this.client.listen("message", this.handleMessages);
		
	    this.client.listen("connect", function(client) {
			console.log("Connected to Respoke!", client);
			
			_this.client.setPresence({ presence: "available" });
			
			_this.client.join({
				id: "the-interview-room", 
				
				onSuccess: function(group) {
					_this.group = group;
					
	                _this.group.listen("join", function(e) {
	                	_this.onMemberJoin(e, _this);
	                });
					
	                _this.group.listen("leave", function(e) {
	                	_this.onMemberLeave(e, _this);
	                });
					
					//Group Discovery
					group.getMembers({	
						onSuccess: function(connections) {
							console.log("group.getMembers", connections);
							_this.renderGroup(connections, _this);
						}
					});
				}
			});
		});
		
		this.client.listen("presence", this.onClientPresenceChange);
		
	    this.client.listen("disconnect", function(e) {
	    	_this.member.save();
	    });
		
		window.sketchpad.change(function() {
			console.log("window.sketchpad.change");
			
			_this.group.sendMessage({
				message: {
					whiteboard: sketchpad.strokes(),
					member: _this.member.toJSON(),
					type: "whiteboard"
				}
			});
		});
		
		this.client.listen("call", function(e) {
			console.log("call");

			var call = e.call;
			
			if (call.caller !== true) {
				call.answer({
					videoLocalElement: document.getElementById("localVideo"),
					videoRemoteElement: document.getElementById("remoteVideo")
				});
				
				$(".fa-toggle-off").hide();
				$(".fa-toggle-on").show();
		
				$(".front").hide();
				$(".back").show();
			}
			
			call.listen("hangup", function() {
		    	//call = null;
		    	//$('#callControls').hide();
		  	});
		});
    },

    // Map events to handler functions
	events: {
		"click .send-msg"				: "sendMessage",
		"submit .msg-type-box form"		: "sendMessage",
		"click .start-whiteboard"		: "startWhiteboard",
		"click .voiceCall"				: "voiceCall",
		"click .videoCall"				: "videoCall",
		"click .screenShare"			: "screenShare",
		"click .logout"					: "logout",
		"submit .signin form"			: "signin",
		"click .reset"					: "reset",
		"click .toggle"					: "toggle",
		"click .toggleVideoMute"		: "toggleVideoMute",
		"click .toggleVideo"			: "toggleVideo",
		"click .hangupVideo"			: "hangupVideo",
		"mouseenter .video-box"			: "showVideoControls",
		"mouseleave .video-box"			: "hideVideoControls",
		"click .profile-image img"		: "togglePresence"
    },
	
	signin: function(e) {
		e.preventDefault();
		
		console.log("signin");
		
		var name = $(".signin-name").val();
		var email = $(".signin-email").val();
		var image = gravatar(email, {size: 110});
		
		this.member.set("name", name);
		this.member.set("email", email);
		
		this.member.set("image", image);
		console.log(this.member.get("image"));
		
		this.member.set("endpointId", email);
		
		// Hide the sign in form
		$(".signin").hide();
		
		//$(".user-profiles").append(_.template($("#ProfileTmpl").html())(this.member.toJSON())); //Add the Profile to the View
		
		this.member.save();
	},
	
	connect: function(model) {
		console.log("connect");

		var token = model.get("token");
		store.set("token", token);
		
		// connect to Respoke
		this.client.connect({
			token: token // Use this in production like you would use appId during development mode.
		});
	},
	
	resolveEndpointPresence: function(e) {
		console.log("resolveEndpointPresence", e);
	},
	
	onMemberJoin: function(e, _this) {
		console.log("onMemberJoin", e);
		console.log("onMemberJoin this", this);
		
		_this.renderGroupMember(e.connection.getEndpoint(), _this);
	},
	
	onMemberLeave: function(e, _this) {
		console.log("onMemberLeave", e);
		console.log("onMemberLeave this", this);
		
		_this.removeGroupMember(e.connection.getEndpoint());
	},
	
	renderGroup: function(connections, _this) {
		console.log("renderGroup", connections, _this);
		
		_.each(connections, function(connection) {
			_this.renderGroupMember(connection.getEndpoint(), _this);
		});
	},
	
	renderGroupMember: function(endpoint, _this) {
		console.log("renderGroupMember endpoint", endpoint);
		
		var member = new Member({
			email: endpoint.id,
			endpointId: endpoint.id,
			image: gravatar(endpoint.id, {size: 110}),
			endpoint: endpoint
		});
		
		this.members.add(member);
		
		//Endpoint Presence for Group Members
		_this.endpoints[endpoint.id] = _this.client.getEndpoint({ id: endpoint.id });

		console.log("renderGroupMember presence");
		console.log("renderGroupMember setPresenceListener", endpoint.id);
		
		endpoint.listen("presence", function (e) {
			console.log("renderGroupMember presence for endpoint", e);

			var profileImage = $("ul.user-profiles li img[data-email='" + e.target.id + "']");

			if(e.target.presence.toLowerCase() === "available") {
				console.log("available");
				profileImage.fadeTo("slow", 1);
			}

			if(e.target.presence.toLowerCase() === "away") {
				console.log("away");
				profileImage.fadeTo("slow", 0.3);
			}
		});
		
		$(".user-profiles").append(_.template($("#ProfileTmpl").html())(member.toJSON())); //Add the Profile to the View
	},
	
	removeGroupMember: function(endpoint) {
		console.log("removeGroupMember endpoint", endpoint);
		
		$("ul.user-profiles li img[data-email='" + endpoint.id +"']").parent().remove();
	},
	
	onRemotePresenceChange: function(e) {
		console.log("onRemotePresenceChange", e);
	},
	
	onClientPresenceChange: function(e) {
		console.log("onClientPresenceChange", e);
		
		var profileImage = $("ul.user-profiles li img[data-email='" + e.target.endpointId + "']");
		
		if(e.target.presence.toLowerCase() === "available") {
			console.log("available");
			profileImage.fadeTo("slow", 1);
		}
		
		if(e.target.presence.toLowerCase() === "away") {
			console.log("away");
			profileImage.fadeTo("slow", 0.3);
		}
	},
	
	togglePresence: function(e) {
		console.log("togglePresence", e);
		console.log("togglePresence this", this);
		
		var _this = this;
		
		if(this.client.presence.toLowerCase() === "available") {
			//Set client presence which will call the corresponding 
			//endpoint presence for the rest of the group.
            this.client.setPresence({
				presence: "away"
            });
		}
		
		if(this.client.presence.toLowerCase() === "away") {
            this.client.setPresence({
                presence: "available"
            });
		}
	},
	
	sendMessage: function(e) {	
		e.preventDefault();	
		
		if(!this.member.has("name")) {
			return;
		}
		
		console.log("sendMessage");
		
		var msg = $(".send-msg-box").val();
		
		var message = new Message();
		
		message.set({
			email: this.member.get("email"),
			name: this.member.get("name"),
			message: msg,
			id: message.guid(),
			image: this.member.get("image"),
			timestamp: moment().format('h:mm'),
			type: "message"
		});
		
		$(".messages").append(_.template($("#MessageTmpl").html())(message.toJSON())); //Add the Message to the View
		
		//Send the message to the group
		this.group.sendMessage({message: message.toJSON()});
	},
	
	handleMessages: function(e) {
		var message = e.message.message;

		console.log("messages: ", e);
		
		var messageTypes = {
			"message": function(message) {
				$(".messages").append(_.template($("#MessageTmpl").html())(message)); //Add the Message to the View
			},

			"whiteboard": function(message) {
				if($(".whiteboard-canvas").is(':hidden')) {
					$(".whiteboard-message").hide();
					$(".whiteboard-canvas").show();
					$(".start-whiteboard").addClass("reset");
					$(".start-whiteboard").text("Reset");
				}
				
				window.sketchpad.strokes(message.whiteboard);
			}
		}[message.type](message);
	},
	
	startWhiteboard: function(e) {
		console.log("startWhiteboard");
		
		if(!this.member.has("name")) {
			return;
		}
		
		$(".whiteboard-message").hide();
		$(".whiteboard-canvas").show();
		$(".start-whiteboard").addClass("reset");
		$(".start-whiteboard").text("Reset");
	},
	
	reset: function(e) {
		window.sketchpad.clear();
		$(".start-whiteboard").removeClass("reset");
		$(".whiteboard-canvas").hide();
		$(".whiteboard-message").show();
		$(".start-whiteboard").text("Get Started");
	},
	
	toggle: function(e) {
		console.log("toggle");
		var _this = this;
		
		if(!this.member.has("name")) {
			return;
		}
		
		$(".fa-toggle-on, .fa-toggle-off").toggle();
		
		$(".front, .back").toggle();
		
		
		// Turn on the camera
		if($(".fa-toggle-on").is(":visible")) {
			var constraints = {
				audio: true,
				video: true
			};
			
			getUserMedia(constraints, function(stream) {
				var localVideo = document.getElementById("localVideo");
			
				_this.localStream = stream;
				attachMediaStream(localVideo, stream);
			
				localVideo.play();
			
			}, function(error){
				console.log("getUserMedia error: ", error);
			});
		} else {
			this.localStream.stop();
		}
		
	},
	
	voiceCall: function(e) {
		console.log("voiceCall");
		
		$(".fa-toggle-off").hide();
		$(".fa-toggle-on").show();
		
		$(".front").hide();
		$(".back").show();
		
		var email = $(e.currentTarget).data("email");
		
		console.log(email);
		
		var remoteEndpoint = this.client.getEndpoint({
			id: email
		});
		
		remoteEndpoint.startAudioCall({
			videoLocalElement: document.getElementById("localVideo"),
			videoRemoteElement: document.getElementById("remoteVideo")
		});
	},
	
	videoCall: function(e) {
		console.log("videoCall");
		
		$(".fa-toggle-off").hide();
		$(".fa-toggle-on").show();
		
		$(".front").hide();
		$(".back").show();
		
		var email = $(e.currentTarget).data("email");
		
		console.log(email);
		
	    /*var constraints = {
			audio: false,
			video: {
				mandatory: {
					chromeMediaSource: 'desktop',
					maxHeight: 2000,
					maxWidth: 2000
				},
				optional: []
			}
	    };*/
		
		var remoteEndpoint = this.client.getEndpoint({
			id: email
		});
		
		/*remoteEndpoint.startCall({
			constraints: constraints,
			videoLocalElement: document.getElementById("localVideo"),
			videoRemoteElement: document.getElementById("remoteVideo")
		});*/
			
		remoteEndpoint.startVideoCall({
			videoLocalElement: document.getElementById("localVideo"),
			videoRemoteElement: document.getElementById("remoteVideo")
		});
	},
	
	screenShare: function(e) {
		console.log("screenShare");
		
		$(".fa-toggle-off").hide();
		$(".fa-toggle-on").show();
		
		$(".front").hide();
		$(".back").show();
		
		var email = $(e.currentTarget).data("email");
		
		console.log(email);
		
		var remoteEndpoint = this.client.getEndpoint({
			id: email
		});
		
		remoteEndpoint.startScreenShare({
			videoLocalElement: document.getElementById("localVideo"),
			videoRemoteElement: document.getElementById("remoteVideo")
		});
	},
	
	toggleVideoMute: function(e) {
		console.log("toggleVideoMute");
		
		console.log(e);
		console.log(this);
		
		$(".fa-microphone, .fa-microphone-slash").toggle();
		this.client.calls[0].toggleAudio();
	},
	
	toggleVideo: function(e) {
		console.log("toggleVideo");
		console.log(this);
		this.client.calls[0].toggleVideo();
	},
	
	hangupVideo: function(e) {
		console.log("hangupVideo");
		console.log(this);
		this.client.calls[0].hangup();
	},
	
	showVideoControls: function(e) {
		console.log("showVideoControls");
		$(".video-controls").fadeIn();
	},
	
	hideVideoControls: function(e) {
		console.log("hideVideoControls");
		$(".video-controls").fadeOut();
	},
	
	logout: function(e) {
		console.log("logout");
		
		if(!this.member.has("name")) {
			return;
		}
		
		this.reset();
		
		this.member.clear();
		
		$(".user-profile li").remove();
		
		$(".message").remove();
		
		$(".signin").show();
		
		
		//Video Reset
		$(".back").hide();
		$(".front").show();
		this.reset();
		
		console.log(this);
		
		if(typeof this.client.calls[0] !== "undefined" && this.client.calls[0] !== null) {
			this.client.calls[0].hangup();
		}
	}
});



window.appView = new AppView();


});//document.ready