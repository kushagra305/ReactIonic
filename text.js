jQuery(document).ready(function ()
{
	loadExixtingFiles();
});


var fileList = [];

function attachFile(){
	var getFileData = this.getFileData('fileuploadInput', 'filedescription');
	fileList = this.createFile(getFileData.file ,getFileData.fileName, getFileData.fileDescription, '', '');
	this.renderFileList()
}


function File(file,fileName, fileDescription, fileUrl, uniqueId){
    this.file = file,
    this.fileName = fileName;
    this.fileDescription = fileDescription;
    this.fileUrl = fileUrl;
    this.uniqueId = uniqueId;
}

function createFile(file,fileName,fileDescription, fileUrl, uniqueId){
    var objFile = new File(file, fileName, fileDescription, fileUrl, uniqueId)
    return fileList.concat(objFile)
}

function getFileData(fileBoxID, descriptionBoxID){
    var fileName = $('#'+'fileuploadInput')[0].files[0].name;
    var file = $('#'+'fileuploadInput')[0].files[0];
    var fileDescription = $('#'+descriptionBoxID).val();
    $('#'+'fileuploadInput').val("");
    $('#'+descriptionBoxID).val("");
    $('#btnattachFile')[0].disabled = true
    return {file: file, fileName: fileName, fileDescription:fileDescription}
}

function renderFileList(){
	var fileListDom = ''
	fileList.forEach(file=>{
		fileListDom  = fileListDom + "<li><span>"+file.fileName+"</span><span>  </span><span>"+file.fileDescription+"</span></li>"
	})
	document.getElementById('fileList').innerHTML = fileListDom;

}

function fileSelected(){
	if($('#'+'fileuploadInput')[0].files[0]=== undefined){
		$('#btnattachFile')[0].disabled = true
		$('#btnhFileupload')[0].disabled = true
	}else{
		$('#btnattachFile')[0].disabled = false
	}
}

function selectFile(){
    uploadMultipleFiles();
}

var fileInput; var serverUrl; var uploadedFilesArray = [];var serverRelativeUrlToFolder;var fileDescription;
var folderName = window.location.href.split('EVID=')[1];
    serverRelativeUrlToFolder = 'CAP_Attachments/'+folderName;

function uploadMultipleFiles(){
    var folderName = window.location.href.split('EVID=')[1];
   // fileDescription = $("textarea[title='File_Description']").val();
    serverRelativeUrlToFolder = 'CAP_Attachments/'+folderName;
    createFolders(serverRelativeUrlToFolder );
    fileInput = $('#'+'FileUpload');   
    var fileCount = fileInput[0].files.length;
    serverUrl = _spPageContextInfo.webAbsoluteUrl;
    var filesUploaded = 0;
    var index;
    //uploadedFilesArray = [];
    for(var i = 0; i < fileList.length; i++){
            var file = fileList[i].file;
            fileDescription = fileList[i].fileDescription;
            var getFile = getMultipleFileBuffer(file, i);
            getFile.done(function(arrayBuffer,i){
                var addFile = addMultipleFileToFolder(arrayBuffer, file, i);
               	addFile.done(function(fileData, status, xhr){
                    var getItem = getListItem(fileData.d.ListItemAllFields.__deferred.uri);
                    getItem.done(function (listItem, status, xhr) {
                        var updatedFile =  updateFileMetaData(listItem.d.__metadata)
                        updatedFile.done(function(listItem, status, xhr){
                        	filesUploaded++;
		                    if(filesUploaded == fileCount){
		                    listUploadedFiles();
		                        alert('File uploaded succesfully ')}
                        })
                         
                    });
                   
                })
                
    })
    }
}
function getMultipleFileBuffer(file,i) {
    debugger;
    var deferred = jQuery.Deferred();
    var reader = new FileReader();
    reader.onloadend = function (e) {
    deferred.resolve(e.target.result,i);
}
reader.onerror = function (e) {
    deferred.reject(e.target.error);
}

reader.readAsArrayBuffer(file);
return deferred.promise();

}

function addMultipleFileToFolder(arrayBuffer,file, i) {
var index = i;
var fileName = file.name;
//uploadedFilesArray.push({name:fileName, url:serverUrl+serverRelativeUrlToFolder})
var fileCollectionEndpoint = String.format(
    "{0}/_api/web/getfolderbyserverrelativeurl('{1}')/files" +
    "/add(overwrite=true, url='{2}')",
    serverUrl, serverRelativeUrlToFolder, fileName);

return jQuery.ajax({
    url: fileCollectionEndpoint,
    type: "POST",
    data: arrayBuffer,
    processData: false,
    headers: {
    "accept": "application/json;odata=verbose",
    "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
    "content-length": arrayBuffer.byteLength
}, success: function(data){
	uploadedFilesArray.push({name:data.d.Name, id:data.d.UniqueId, url:data.d.ServerRelativeUrl})
	console.log(data);
}
});
}

function updateFileMetaData(itemMetaData){
    var body = String.format("{{'__metadata':{{'type':'{0}'}},'File_Description':'{1}'}",
            itemMetaData.type, fileDescription );
        return jQuery.ajax({
            url: itemMetaData.uri,
            type: "POST",
            data: body,
            headers: {
                "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
                "content-type": "application/json;odata=verbose",
                "content-length": body.length,
                "IF-MATCH": itemMetaData.etag,
                "X-HTTP-Method": "MERGE"
            }
        });
}

  function getListItem(fileListItemUri) {

        // Send the request and return the response.
        return jQuery.ajax({
            url: fileListItemUri,
            type: "GET",
            headers: { "accept": "application/json;odata=verbose" }
        });
    }


function createFolders(serverRelativeUrlToFolder) {  
var siteUrl = _spPageContextInfo.webAbsoluteUrl;
var fullUrl = siteUrl + "/_api/web/folders";
jQuery.ajax({
'url' : siteUrl + "/_api/Web/Folders/Add('"+ serverRelativeUrlToFolder + "')",
'type' : 'POST',
'headers' : {
'accept' : 'application/json; odata=verbose',
'content-type' : 'application/json; odata=verbose',
'X-RequestDigest' : $('#__REQUESTDIGEST').val()
},

success: function (data) {

},

error: function (data) {

}

}) }

function listUploadedFiles(){
var fileList = ''
 uploadedFilesArray.forEach(function(file){
            return fileList = fileList +"<li><a  href='' onClick=(openFile('"+file.url+"'))>"+file.name+"</a><button class='btn btn-labeled btn-danger' onClick=(deleteFile('"+file.name+"'))>Delete</button></li>"
        })
 document.getElementById('fileAttachmentList').innerHTML = fileList 
      
}

function openFile(fileUrl){
	window.open(fileUrl)
	this.event.preventDefault();
}

function deleteFile(fileName ){
	this.event.preventDefault();
	clientContext = new SP.ClientContext.get_current();
    oWebsite = clientContext.get_web();  
    clientContext.load(oWebsite); 
    clientContext.executeQueryAsync(function ()   
    {  
        fileUrl = oWebsite.get_serverRelativeUrl() +'/ '+ 
        serverRelativeUrlToFolder+'/'+fileName;  
        this.fileToDelete = oWebsite.getFileByServerRelativeUrl(fileUrl);  
        this.fileToDelete.deleteObject(); 
    }); 
    clientContext.executeQueryAsync(function(){
    	alert("File Deleted");
		loadExixtingFiles();
    }, Function.createDelegate(this, this.OnFailure));
	
}

function loadExixtingFiles(){
uploadedFilesArray = [];
    clientContext = new SP.ClientContext.get_current();
    oWebsite = clientContext.get_web();  
    var folder = oWebsite.getFolderByServerRelativeUrl(serverRelativeUrlToFolder);
    files = folder.get_files();
    clientContext.load(files);
        clientContext.executeQueryAsync( function() {

        var c = files.get_count(); 
        if(c<=0) uploadedFilesArray = [];
        for(var i = 0; i< c;i++ ) {
          var listItem = files.getItemAtIndex(i);
          uploadedFilesArray.push({name:listItem.get_name(), url: listItem.get_serverRelativeUrl()});
        }  
        listUploadedFiles();
     }, Function.createDelegate(OnFailure));
    

    function OnSuccess()
    {                                              
        var listItemEnumerator = files.getEnumerator();
            while (listItemEnumerator.moveNext()) {
                var fileUrl = listItemEnumerator.get_current().get_serverRelativeUrl();  
                uploadedFilesArray.push({name:"File NAme", url:fileUrl});           
            }                                         
    }
    function OnFailure(){
    	console.log("error");
    }
}
