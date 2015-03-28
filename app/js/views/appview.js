var AppView = Backbone.View.extend({
	el: $("#theinterview"),
	
	initialize: function() {
		console.log("initialize appview");
		
		var _this = this;
		
		respoke.log.setLevel("debug");
		
		this.client = respoke.createClient();	// instance of the Respoke Client
		
		this.endpoints = {};
		
		this.directConnection = null;
		
		console.log("initialize", this);
		
		this.members = new Members();
		
		this.member = new Member();
		
		if(!this.member.has("name")) {
			console.log("get member name");
			
			$(".signin").show();
		}
		
		// Event Listeners
		this.listenTo(this.member, "sync", this.connect);
		
		this.client.listen("message", function(e){
			console.log("client.listen#message: ", e);

			_this.handleMessages(e);
		});
		
	    this.client.listen("connect", function(client) {
			console.log("Connected to Respoke!", client);
			
			$(".operations").show();
			
			_this.client.setPresence({ presence: "available" });
			
			_this.client.join({
				id: "the-interview", 
				
				onSuccess: function(group) {
					_this.group = group;
					
	                group.listen("join", function(e) {
	                	_this.onMemberJoin(e, _this);
	                });
					
	                group.listen("leave", function(e) {
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
		
		
		window.onload = function() {
			window.sketchpad = Raphael.sketchpad("whiteboard-canvas", {
				width: "100%", //550
				height: 200, //200
				editing: true
			});
			
			window.sketchpad.change(function() {
				console.log("window.sketchpad.change");
			
				var _this = window.appView;
			
				if(typeof _this.directConnection !== "undefined" && _this.directConnection !== null) {
					_this.directConnection.sendMessage({
						message: {
							whiteboard: sketchpad.strokes(),
							member: _this.member.toJSON(),
							type: "whiteboard"
						}
					});
				} else {
					_this.group.sendMessage({
						message: {
							whiteboard: sketchpad.strokes(),
							member: _this.member.toJSON(),
							type: "whiteboard"
						}
					});
				}
			});
		};
		
		
		
		this.client.listen("call", function(e) {
			console.log("call", e);

			var call = e.call;
			
			if (call.caller !== true) {
				_this.call = call.answer({
					videoLocalElement: document.getElementById("localVideo"),
					videoRemoteElement: document.getElementById("remoteVideo")
				});
				
				$(".fa-toggle-off").hide();
				$(".fa-toggle-on").show();
		
				$(".front").hide();
				$(".back").show();
			}
			
			call.listen("hangup", function() {
				console.log("hangup", e);
		    	//call = null;
				$(".asterisk").css("color", "");
				$(".pstn").css("color", "");
		  	});
		});
		
		this.count = 0;
		this.totalMessageLength = 0;
		this.messageData = [];
		this.prevMessage = [];
		
		this.client.listen("direct-connection", function(e) {
			console.log("direct-connection", e);

			_this.directConnection = e.directConnection;
			
		     var directConnection = e.directConnection;
			 
		     directConnection.accept();
			 
		     directConnection.listen("open", function(e) {
				console.log("direct-connection open", e);

				var remoteEndpointId = e.target.remoteEndpoint.id;
		
				var localEndpointId = _this.member.get("email");

				$("i.directConnection[data-email='"+ remoteEndpointId +"']").each(function(){
					$(this).removeClass("fa-spinner").addClass("fa-lock").css("color", "rgb(33, 184, 198)");
				});

				$("i.directConnection[data-email='"+ localEndpointId +"']").each(function(){
					$(this).removeClass("fa-spinner").addClass("fa-lock").css("color", "rgb(33, 184, 198)");
				});
				
				$(".send-msg-box").prop("disabled", false);
				$(".send-msg").prop("disabled", false);
		     });
			 
		     directConnection.listen("close", function(e) {
				 console.log("direct-connection close", e);
		         _this.directConnection = null;
				 
 				var remoteEndpointId = e.target.remoteEndpoint.id;
		
 				var localEndpointId = _this.member.get("email");

 				$("i.directConnection[data-email='"+ remoteEndpointId +"']").each(function(){
 					$(this).removeClass("fa-spinner").removeClass("fa-lock").addClass("fa-lock").css("color", "");
 				});

 				$("i.directConnection[data-email='"+ localEndpointId +"']").each(function(){
 					$(this).removeClass("fa-spinner").removeClass("fa-lock").addClass("fa-lock").css("color", "");
 				});
				
 				$(".send-msg-box").prop("disabled", false);
 				$(".send-msg").prop("disabled", false);
		     });
			 

			directConnection.listen("message", function(e){
				console.log("directConnection.listen#message e:", e);

				_this.handleMessages(e);
			});
		});
		
		// Filesharing events
		$(".container").on("dragover drop", ".top-header", this.dragDrop);
		$(".container").on("dragleave", ".top-header", this.dragLeave);
		
		$(".content").on("dragover drop", ".msg-type-box", this.dragDrop);
		$(".content").on("dragleave", ".msg-type-box", this.dragLeave);
    },

    // Map events to handler functions
	events: {
		"click .send-msg"				: "sendMessage",
		"submit .msg-type-box form"		: "sendMessage",
		"click .start-whiteboard"		: "startWhiteboard",
		"click .voiceCall"				: "voiceCall",
		"click .videoCall"				: "videoCall",
		"click .screenShare"			: "screenShare",
		"click .directConnection"		: "startDirectConnection",
		"click .asterisk"				: "asterisk",
		"click .pstn"					: "dialPad",
		"submit .pstn-phone form"		: "pstn",
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
		
		var email = $(e.target).data("email");
		
		if(this.member.get("email") === email) {
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
		}
	},
	
	sendMessage: function(e) {	
		console.log("sendMessage:", e);
		e.preventDefault();	
		
		if(!this.member.has("name")) {
			return;
		}
		
		console.log("sendMessage");
		
		var msg = Autolinker.link(_.escape($(".send-msg-box").val()));
		
		var message = new Message();
		
		message.set({
			email: this.member.get("email"),
			name: this.member.get("name"),
			message: msg,
			id: message.guid(),
			image: this.member.get("image"),
			timestamp: moment().format('h:mm'),
			src: "",
			title: "",
			type: "message"
		});
		
		$(".messages").append(_.template($("#MessageTmpl").html())(message.toJSON())); //Add the Message to the View
		
		$(".send-msg-box").val("");
		
		if(typeof this.directConnection !== "undefined" && this.directConnection !== null) {
			//Send the message to a 1:1 user using RTCDataChannel
			console.log("sendMessage directConnection", this.directConnection);
			this.directConnection.sendMessage({message: message.toJSON()});
			
			var localEndpointId = this.member.get("email");
			var remoteEndpointId = this.directConnection.remoteEndpoint.id;
			
			$("i.directConnection[data-email='"+ remoteEndpointId +"']").each(function(){
				$(this).css("color", "rgb(33, 184, 198)");
			});

			$("i.directConnection[data-email='"+ localEndpointId +"']").each(function(){
				$(this).css("color", "rgb(33, 184, 198)");
			});
		} else {
			//Send the message to the group
			console.log("sendMessage group");
			this.group.sendMessage({message: message.toJSON()});
		}
	},
	
	handleMessages: function(e) {
		console.log("messages: ", e);
		
		var _this = window.appView;
		var message = e.message.message;
		
		var messageTypes = {
			"message": function(message) {
				$(".messages").prepend(_.template($("#MessageTmpl").html())(message)); //Add the Message to the View
				
				console.log("handleMessage this.directConnection:", this.directConnection);
				console.log("handleMessage this.directConnection this:", this);
				console.log("handleMessage this.directConnection window:", window);
				
				if(typeof _this.directConnection !== "undefined" && _this.directConnection !== null) {
					var localEndpointId = _this.member.get("email");
					var remoteEndpointId = _this.directConnection.remoteEndpoint.id;
					console.log(localEndpointId, remoteEndpointId);
			
					$("i.directConnection[data-email='"+ remoteEndpointId +"']").each(function(){
						console.log($(this));
						$(this).css("color", "rgb(33, 184, 198)");
					});

					$("i.directConnection[data-email='"+ localEndpointId +"']").each(function(){
						console.log($(this));
						$(this).css("color", "rgb(33, 184, 198)");
					});
				}
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
	
	dragDrop: function(e) {
		console.log("dragover drop: ", e);
		var _this = window.appView;
		var el = this;
		e.stopPropagation();
		e.preventDefault();
				
		$(this).jrumble({
			x: 1,
			y: 0,
			rotation: 0
		});
	
		$(this).trigger("startRumble");
		
		if(e.type === "drop") {
			var dataTransfer = e.originalEvent.dataTransfer;
			dataTransfer.dropEffect = "copy";
			
			var files = dataTransfer.files;
			console.log("drop files: ", files);
			
			
			
			_.each(files, function(file){
				var fileReader = new FileReader();
		
				fileReader.onload = (function(file, el) {
					return function(e) {
						console.log("fileReader.onload e: ", e);
						console.log("fileReader.onload file: ", file);
						console.log("member: ", _this.member);


						var msg = ["<img class='thumb' src='", e.target.result,
								   "' title='", file.name, "' width='420'", "/>"].join("");
						
						var message = new Message();
		
						message.set({
							email: _this.member.get("email"),
							name: _this.member.get("name"),
							message: msg,
							id: message.guid(),
							image: _this.member.get("image"),
							timestamp: moment().format('h:mm'),
							type: "message"
						});
		
						$(".messages").prepend(_.template($("#MessageTmpl").html())(message.toJSON())); //Add the Message to the View
						
						if(typeof _this.directConnection !== "undefined" && _this.directConnection !== null) {
							//Send the message to a 1:1 user using RTCDataChannel
							console.log("dragDrop directConnection: ", _this.directConnection);
							_this.directConnection.sendMessage({message: message.toJSON()});
			
							var localEndpointId = _this.member.get("email");
							var remoteEndpointId = _this.directConnection.remoteEndpoint.id;
			
							$("i.directConnection[data-email='"+ remoteEndpointId +"']").each(function(){
								$(this).css("color", "rgb(33, 184, 198)");
							});

							$("i.directConnection[data-email='"+ localEndpointId +"']").each(function(){
								$(this).css("color", "rgb(33, 184, 198)");
							});
						} else {
							//Send the message to the group
							console.log("dragDrop group");
							_this.group.sendMessage({message: message.toJSON()});
						}
					};
				})(file, el);
			
				fileReader.readAsDataURL(file);
			});

			$(this).trigger("stopRumble");
		}
	},
	
	dragLeave: function(e) {
		$(this).trigger("stopRumble");
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
			/*
            this.localMedia = respoke.LocalMedia({
				element: document.getElementById("localVideo")
                state: {receiveOnly: false},
                hasScreenShare: false,
                constraints: {
                    audio: true,
                    video: true
                }
            });
			
			this.localMedia.start();*/
								
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
			if(this.localStream) {
				this.localStream.stop();
			}
			
			if(this.call) {
				this.call.hangup();
			}
		}
		
	},
	
	startDirectConnection: function(e) {
		console.log("directConnection");
		
		if(typeof this.directConnection !== "undefined" && this.directConnection !== null) {
			this.directConnection.close();
			this.directConnection = null;
		} else {
			$(".send-msg-box").prop("disabled", true);
			$(".send-msg").prop("disabled", true);
		
			var remoteEndpointId = $(e.currentTarget).data("email");
			console.log(remoteEndpointId);
		
			var localEndpointId = this.member.get("email");
			console.log(localEndpointId);
		
			$("i.directConnection[data-email='"+ remoteEndpointId +"']").each(function(){
				$(this).removeClass("fa-lock").addClass("fa-spinner");
			});
		
			$("i.directConnection[data-email='"+ localEndpointId +"']").each(function(){
				$(this).removeClass("fa-lock").addClass("fa-spinner");
			});
		
			var remoteEndpoint = this.client.getEndpoint({
				id: remoteEndpointId
			});
		
			remoteEndpoint.startDirectConnection();
		}
	},
	
	asterisk: function(e) {
		console.log("asterisk");
		
		var color = $(e.currentTarget).css("color");
		console.log("color", color);
		
		if(color == "rgb(33, 184, 198)") {
			this.call.hangup();
			$(e.currentTarget).css("color", "");
		} else {
			$(e.currentTarget).css("color", "rgb(33, 184, 198)");
		
			this.call = this.client.startAudioCall({
				endpointId: "sales"
			});
		}
	},
	
	dialPad: function(e) {
		console.log("dialPad");
		
		$(".pstn-phone").toggle();
	},
	
	pstn: function(e) {
		e.preventDefault();	
		
		var phoneNumber = $(".phone-number").val().trim();
		
		console.log("pstn phoneNumber:", phoneNumber);
		console.log("pstn this:", this);
		
		var color = $(".pstn").css("color");
		console.log("color", color);
		
		if(color == "rgb(33, 184, 198)") {
			this.call.hangup();
			$(".pstn").css("color", "");
		} else {
			$(".pstn").css("color", "rgb(33, 184, 198)");
		
			this.call = this.client.startPhoneCall({
				number: phoneNumber,
				callerId: "+16146625045"
			});
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
		
		this.call = remoteEndpoint.startAudioCall({
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
		
		var remoteEndpoint = this.client.getEndpoint({
			id: email
		});
			
		this.call = remoteEndpoint.startVideoCall({
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
		
		this.call = remoteEndpoint.startScreenShare({
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

