//Override Webservice execution and insert processing queue and throttling
//Very good for VE map where user can pan and zoom very quickly.
//Increase the maxConcurrentCall if you require more servcies to be called asycn, IE default is only 2

/*global Sys */

/*global QueuedCall */
QueuedCall = function (servicePath, methodName, useGet, params, onSuccess, onFailure, userContext, timeout) {
    this.servicePath = servicePath;
    this.methodName = methodName;
    this.useGet = useGet;
    this.params = params;
    this.onSuccess = onSuccess;
    this.onFailure = onFailure;
    this.userContext = userContext;
    this.timeout = timeout;
  };

/*global GlobalCallQueue */
GlobalCallQueue = {
  callQueue : [],    // Maintains the list of webmethods to call
  callInProgressNames : [],    // Maintains the list of webmethods names in progress by browser
  callInProgress : 0,    // Number of calls currently in progress by browser
  maxConcurrentCall : 2, // Max number of calls to execute at a time
  call : function(servicePath, methodName, useGet, params, onSuccess, onFailure, userContext, timeout) {
      var queuedCall = new QueuedCall(servicePath, methodName, useGet, params, onSuccess, onFailure, userContext, timeout);
      //if method name is already waiting then remove from queue then add the new call
      for (var x=0;x<GlobalCallQueue.callQueue.length;x+= 1) {
        if (GlobalCallQueue.callQueue[x].methodName === queuedCall.methodName) {
          Array.removeAt( GlobalCallQueue.callQueue, x);
          break;
        }
      }
      Array.add(GlobalCallQueue.callQueue,queuedCall);
      GlobalCallQueue.run();
    },
  run : function() {
      /// Execute a call from the call queue
      if (GlobalCallQueue.callInProgress < GlobalCallQueue.maxConcurrentCall) {
        if (GlobalCallQueue.callQueue.length === 0)  {
          return;
        } 
        GlobalCallQueue.callInProgress += 1;
        //get first index that is not already in progess
        var runIndex = -1;
        for (var x=0;x<GlobalCallQueue.callQueue.length;x+= 1) {
          var found=false;
          for (var y=0;y<GlobalCallQueue.callInProgressNames.length;y += 1) {
            if (GlobalCallQueue.callQueue[x].methodName === GlobalCallQueue.callInProgressNames[y]) {
              found=true;
              break;
            }
          }  
          if (!found) {
            runIndex = x;
            break;
          }
        }
        if (runIndex !== -1) {
          var queuedCall = GlobalCallQueue.callQueue[runIndex];
          Array.removeAt( GlobalCallQueue.callQueue, runIndex );
          //set name in progress
          Array.add(GlobalCallQueue.callInProgressNames,queuedCall.methodName);
          // Call the web method
          queuedCall.execute();
        } else {
          GlobalCallQueue.callInProgress -= 1;
        }
      }          
    },
  callComplete : function(methodName) {
      GlobalCallQueue.callInProgress -= 1;
      //remove name in progress
      for (var x=0;x<GlobalCallQueue.callInProgressNames.length;x += 1) {
        if (GlobalCallQueue.callInProgressNames[x] === methodName) {
          Array.removeAt( GlobalCallQueue.callInProgressNames, x );
          break;
        }
      }
      GlobalCallQueue.run();
    }
};

QueuedCall.prototype = {
  execute : function() {
      Sys.Net.WebServiceProxy.original_invoke(this.servicePath,
                                              this.methodName, 
                                              this.useGet, 
                                              this.params,  
                                              Function.createDelegate(this, this.onSuccessDelegate), // Handle call complete
                                              Function.createDelegate(this, this.onFailureDelegate), // Handle call complete
                                              this.userContext, 
                                              this.timeout );
    },
  onSuccessDelegate : function (result, userContext, methodName) {
      this.onSuccess(result, userContext, methodName);
      GlobalCallQueue.callComplete(methodName);            
    },
  onFailureDelegate : function (result, userContext, methodName) {
      this.onFailure(result, userContext, methodName);
      GlobalCallQueue.callComplete(methodName);            
    }
};

//override invoke
Sys.Net.WebServiceProxy.original_invoke = Sys.Net.WebServiceProxy.invoke;
Sys.Net.WebServiceProxy.invoke = function Sys$Net$WebServiceProxy$invoke(servicePath, 
                                                                         methodName, 
                                                                         useGet, 
                                                                         params, 
                                                                         onSuccess, 
                                                                         onFailure, 
                                                                         userContext, 
                                                                         timeout) {   
    GlobalCallQueue.call(servicePath, methodName, useGet, params, onSuccess, onFailure, userContext, timeout);
  };

if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }