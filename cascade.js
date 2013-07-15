define(['jquery','buildable','eventemitter2','underscore', '_.mixins'],
function(   $   , Buildable , Eventemitter2 , undef      , undef     ) {

	// internal methods
	var cascade = {
		add: function(task) {
			if (_.isArray(task)) {
				this.tasks = this.tasks.concat(task);
			} else {
				this.tasks.push(task);
			}
		},

		run: function(common, context) {
			common = common || {};

			var lastdefer = true;

			_.each(this.tasks, function (task, order) {
				// create the defer object.
				var defer = $.Deferred();

				// only start the new task when the previous one is finished.
				$.when(lastdefer).then(function() {
					task.call(context, defer, common);
				});
				
				// set the lastdefer to be the currente defet.
				lastdefer = defer;
			});

			// return a defer object.
			return lastdefer;
		}
	};

	var Cascade = Object.create(Buildable);
	Cascade.extend(Eventemitter2.prototype, {
		init: function(tasks) {
			// bnd the cascade method
			_.bindAll(this,'cascade');

			// create hte tasks array.
			this.tasks = tasks || [];
		},

		cascade: function(method) {
			var args = _.args(arguments, 1);
			return cascade[ method ].apply(this, args);
		},

		run: cascade.run,
	})

	return Cascade;
});