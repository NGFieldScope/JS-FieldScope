//Override Webservice execution and insert processing queue and throttling
//Very good for VE map where user can pan and zoom very quickly.
//Increase the _maxConcurrentCall if you require more servcies to be called asycn, IE default is only 2
var GlobalCallQueue = {
    _callQueue : [],    // Maintains the list of webmethods to call
    _callInProgressNames : [],    // Maintains the list of webmethods names in progress by browser
    _callInProgress : 0,    // Number of calls currently in progress by browser
    _maxConcurrentCall : 2, // Max number of calls to execute at a time
    call : function(servicePath, methodName, useGet, 
        params, onSuccess, onFailure, userContext, timeout)
    {
        
        var queuedCall = new QueuedCall(servicePath, methodName, useGet, 
            params, onSuccess, onFailure, userContext, timeout);


        //if method name is already waiting then remove from queue then add the new call
        for (var x=0;x<GlobalCallQueue._callQueue.length;x++)
        {
            if (GlobalCallQueue._callQueue[x]._methodName==queuedCall._methodName)
            {
                Array.removeAt( GlobalCallQueue._callQueue, x);
                break;
            }
        }   

        Array.add(GlobalCallQueue._callQueue,queuedCall);
        GlobalCallQueue.run();
    },
    run : function()
    {
        /// Execute a call from the call queue
        if (GlobalCallQueue._callInProgress < GlobalCallQueue._maxConcurrentCall)
        {
            if( 0 == GlobalCallQueue._callQueue.length ) 
            {
                return;
            } 
                       
            GlobalCallQueue._callInProgress ++;
        
            //get first index that is not already in progess
            var runIndex = -1;
            for (var x=0;x<GlobalCallQueue._callQueue.length;x++)
            {
                var found=false;
                for (var y=0;y<GlobalCallQueue._callInProgressNames.length;y++)
                {
                    if (GlobalCallQueue._callQueue[x]._methodName==GlobalCallQueue._callInProgressNames[y])
                    {
                        found=true;
                        break;
                    }
                }  
                if (!found)
                {
                    runIndex = x;
                    break;
                }
            }
            if (runIndex!=-1)
            {
            

                var queuedCall = GlobalCallQueue._callQueue[runIndex];
                Array.removeAt( GlobalCallQueue._callQueue, runIndex );             
                
                //set name in progress
                Array.add(GlobalCallQueue._callInProgressNames,queuedCall._methodName);
                
                // Call the web method
                queuedCall.execute();
            }else
            {
                GlobalCallQueue._callInProgress --;
            }
        }          
    },
    callComplete : function(methodName)
    {
        GlobalCallQueue._callInProgress --;
        //remove name in progress
        for (var x=0;x<GlobalCallQueue._callInProgressNames.length;x++)
        {
            if (GlobalCallQueue._callInProgressNames[x]==methodName)
            {
                Array.removeAt( GlobalCallQueue._callInProgressNames, x );
                break;
            }
        }
        GlobalCallQueue.run();
    }
};

QueuedCall = function( servicePath, methodName, useGet, params, 
    onSuccess, onFailure, userContext, timeout )
{
    this._servicePath = servicePath;
    this._methodName = methodName;
    this._useGet = useGet;
    this._params = params;
    
    this._onSuccess = onSuccess;
    this._onFailure = onFailure;
    this._userContext = userContext;
    this._timeout = timeout;
}

QueuedCall.prototype = 
{
    execute : function()
    {
        Sys.Net.WebServiceProxy.original_invoke( 
            this._servicePath, this._methodName, this._useGet, this._params,  
            Function.createDelegate(this, this.onSuccess), // Handle call complete
            Function.createDelegate(this, this.onFailure), // Handle call complete
            this._userContext, this._timeout );
    },
    onSuccess : function(result, userContext, methodName)
    {
        this._onSuccess(result, userContext, methodName);
        GlobalCallQueue.callComplete(methodName);            
    },        
    onFailure : function(result, userContext, methodName)
    {
        this._onFailure(result, userContext, methodName);
        GlobalCallQueue.callComplete(methodName);            
    }        
};

//override invoke
Sys.Net.WebServiceProxy.original_invoke = Sys.Net.WebServiceProxy.invoke;
Sys.Net.WebServiceProxy.invoke = 
    function Sys$Net$WebServiceProxy$invoke(servicePath, methodName, 
        useGet, params, onSuccess, onFailure, userContext, timeout)
{   
    GlobalCallQueue.call(servicePath, methodName, useGet, params, 
        onSuccess, onFailure, userContext, timeout);
}

if (typeof(Sys) !== "undefined") Sys.Application.notifyScriptLoaded();