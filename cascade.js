define(['jquery','buildable','eventemitter2','underscore', '_.mixins'],
function(   $   , Buildable , Eventemitter2 , undef      , undef     ) {

	var Cascade = Object.create(Buildable);
	Cascade.extend(Eventemitter2.prototype, {
		init: function(taskorder, tasks) {
			// tasks are functions that take a promise as their first parameter 
			// and somewhere in time solves the promise, so that another task may be run.
			// All solved parameters are passed on to the next fun

		reset: function() {
			this.done = {};
			this.status = 'unstarted';
		},

		isComplete: function(taskname) {
			if (taskname) {
				return this.done[ taskname ];
			} else {
				return this.status === 'complete';
			}
		},

		add: function(name, task) {

			// first deal with the name
			if ( _.isArray(name) ) {

				if (!task) {
					// if there is no task object,
					// assume it is an array of anonymous tasks
					_.each(name, this.add);
				} else {
					// assume 'name' is an array of task names
					// merge the arrays
					this.taskorder = this.taskorder.concat(name);
				}

			} else if (typeof name === 'function') {
				// if the name is a function, assume it is an unnamed task,
				// use taskorder.length (which is always the size of the taskorder lengh + 1) 
				// as the task name
				var task = name,
					name = this.taskorder.length;

				this.taskorder.push(name);

			} else if (typeof name === 'string') {
				this.taskorder.push(name);
			}

			// then deal with the task
			if ( typeof task === 'function' ) {
				// use the name as hash
				this.tasks[ name ] = task;
			} else if ( task === 'object' ) {

				// merge the objects
				this.tasks = _.extend(this.tasks, task);
			}

			return this;
		},
		
		remove: function(name) {

			if ( _.isArray(name) ) {
				// recursive
				_.each(name, this.remove);
			} else {

				this.taskorder = _.without(this.taskorder, name);
				delete this.tasks[ name ];
			}

			return this;
		},

		get: function(name) {
			return this.tasks[ name ];
		},

		rerun: function(common, options) {
			this.reset();
			this.run(common, options);
		},

		// runs a sequence of tasks
		run: function(common, options) {
			// common: object common to all tasks, passed as second parameter
			// options: additional options
			//			- silent: true if no events are requested
			//			- ini
			//			- end

			if (this.isComplete()) { return true; }

			var common = common || {},
				options = options || {},
				iniIndex = options.ini ?  _.indexOf(this.taskorder, ini_end[0]) : 0,
				endIndex = options.end ? _.indexOf(this.taskorder, ini_end[1]) : this.taskorder.length -1;

			if (iniIndex !== -1 && endIndex !== -1) {

				var _this = this,
					toRun = _.clone(this.taskorder).slice(iniIndex, endIndex + 1),
					lastDefer = false;

				// build up the promise chain
				_.each(toRun, function(taskname, index) {

					var task = _this.tasks[ taskname ],		// get the task
						currDefer = $.Deferred();		// create the defer object for the current task

					// emit events when this task is done
					currDefer.then(function() {
						_this._complete(taskname, options);
					});

					if (lastDefer) {
						// if there are promises, wait until it is resolved to run
						lastDefer.then(
							function() {
								// emit the events properly for the last task
								_this._start(toRun[ index + 1 ], options);

								// effectively run the task.
								// pass the promise to be solved by the task as first argument
								// and the common obj as second argument
								task(currDefer, common);
							}
						);
					} else {
						// emit the events properly for the last task
						_this._start(taskname, options);

						// else, if there are no deferrals on list,
						// task the task immediately
						// pass the promise to be solved by the task as first argument
						// and the common obj as second argument
						task(currDefer, common);
					}

					// set the lastDefer value to the current task promise
					lastDefer = currDefer;
				});

				// return the defer of the last task, so that
				// this respects the promise spec
				return lastDefer;
			}
		},

		// method to deal with the start of each one of the tasks
		_start: function(taskname, options) {
			if (!options.silent) {
				this.emit('start', taskname);
				this.emit('start:' + taskname);
			}
			this.started[ taskname ] = true;

			// sequence started event
			if ( taskname === this.taskorder[0] ) {
				if (!options.silent) {
					this.emit('sequence-start');
				}
				// the sequence is incomplete
				this.status = 'incomplete';
			}
		},

		// method that deals with the completion of each one of the tasks.
		_complete: function(taskname, options) {

			// task-complete event
			if (!options.silent) {
				this.emit('complete', taskname);
				this.emit('complete:' + taskname);
			}
			this.done[ taskname ] = true;

			// sequence complete event
			if ( taskname === _.last(this.taskorder) ) {
				if (!options.silent) {
					this.emit('sequence-complete');
				}
				this.status = 'complete';
			}
		},
	})

	return Cascade;
});