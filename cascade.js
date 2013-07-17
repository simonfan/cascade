define(['jquery','buildable','underscore', '_.mixins'],
function(   $   , Buildable , undef      , undef     ) {

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
				/*
					This code is pretty tricky:
					1: lastdefer starts as true, so that the first task is instantly run.
					2: lsatdefer value is updated at each task loop.
					3: 'when' lastdefer is resolved, a function creates a new defer
						and passes it to the next task. 
					4: if the next task returns a not undefined object, it is set as 
						the 'lastdefer'. This is done so that tasks may return a promise instead 
						of calling next function.
				*/
				
				// only start the new task when the previous one is finished.
				lastdefer = $.when(lastdefer).then(function() {
					// create the defer object.
					var defer = $.Deferred(),
						next = defer.resolve,
						res = task.call(context, next, common);

					return typeof res !== 'undefined' ? res : defer;
				});
			});

			// return a defer object.
			return lastdefer;
		}
	};

	var Cascade = Object.create(Buildable);
	Cascade.extend({
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

		add: cascade.add,

		run: cascade.run,
	})

	return Cascade;
});