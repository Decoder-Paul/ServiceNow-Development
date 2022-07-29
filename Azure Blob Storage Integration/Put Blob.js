var payload = {
    "Customer": "VPT",
    "Environment": "CTS",
    "Region": "US South Central",
    "VM Type": "General Purpose: 4GB of RAM per vCPU",
    "Number of vCPU": 2,
    "RAM in GB": 8,
    "Instance": "D2ds v4",
    "Storage IOPS": 0,
    "Storage MBps": 0,
    "Network MBps Bandwidth": 0,
    "Additional Storage": "Yes",
    "Number of Additional Disk": 1,
    "Additional Disk Details": [
        {
            "disk_type": "Standard HDD",
            "disk_size_in_gb": "128"
        }
    ],
    "Pricing": "Price Pay as you with BYOL"
};
var current = new GlideRecord('sc_req_item');
current.get('eb1482111ba1bc506f7976ae034bcb24');

var fileName = current.number+'.json';
//gs.log(JSON.stringify(payload), current.number);
var attachment = new GlideSysAttachment();
var str = JSON.stringify(payload, null, "\t");
var attachment_id = attachment.write(current, fileName, 'text/plain', str);
var r = new sn_ws.RESTMessageV2('Azure Storage Integration', 'Post Blob');
r.setStringParameter('file_name', fileName);
r.setStringParameter('content_size', str.length);
r.setRequestBodyFromAttachment(attachment_id);
var now = new Date();
// var dateTime = gdt.getByFormat('EEE, dd MMM yyyy HH:mm:ss')+' GMT';
r.setStringParameter('header_date', now.toGMTString());
var response = r.execute();
gs.print(response.getStatusCode());
if(response.getStatusCode() != 201){
	gs.log(response.getBody(), current.number);
	gs.log(response.getErrorMessage(), current.number);
}