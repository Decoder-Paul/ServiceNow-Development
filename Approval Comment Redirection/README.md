# Approval Comment Redirection
This POC is used for a scenario where the approver will comment in [Approval page](https://github.com/Decoder-Paul/ServiceNow-Development/blob/master/Approval%20Comment%20Redirection/Comment%20from%20Approval.PNG) and that comment will be redirected to the [RITM page](https://github.com/Decoder-Paul/ServiceNow-Development/blob/master/Approval%20Comment%20Redirection/RITM%20Comment.PNG) triggered by a business rule.
The comment will be appended with a link of UI Page to capture the comment of requestor and further redirect it to the approval page.
## Business Rule
The BR is applied on `sysapproval_approver` table which will be triggered on `Comments` changes.
![alt text](https://github.com/Decoder-Paul/ServiceNow-Development/blob/master/Approval%20Comment%20Redirection/BR%20Run%20Condition.PNG)
#### URL Parameter
The BR Script is creating the url of the UI Page with two query variables `sysparm_ui_page` & `sysparm_doc`.
* *sysparm_ui_page* - used for bypassing the UI Action of page redirection on Portal for ESS users.
* *sysparm_doc* - used for passing the `sys_id` of the record of approval table through Url which later used in the UI Page for finding the RITM record.
#### Rendered URL
![alt text](https://github.com/Decoder-Paul/ServiceNow-Development/blob/master/Approval%20Comment%20Redirection/RITM%20Comment.PNG)
## UI Page
the requestor can open the UI Page in new window by clicking the **Clicking me** link in the comment section.

![alt text](https://github.com/Decoder-Paul/ServiceNow-Development/blob/master/Approval%20Comment%20Redirection/Comment%20Modal.PNG)
#### Functionalities
* It consists of Glide Scripting for finding the RITM record details like RITM no & Short Description which is rendered over the modal window
* The `getParmVal()` function is used to fetch the `sysparm_doc` from the url and used into server call.
* The client side functions `serverCall` in the UI Page making synchronous GlideAjax call to server for posting the comment into the `sc_req_item` table.
* It's also checking the status of the ticket based on that it'll show the below message.
![pic of closed ritm](https://github.com/Decoder-Paul/ServiceNow-Development/blob/master/Approval%20Comment%20Redirection/Closed%20Ritm.PNG)
* Finally the comment captured in the modal is redirected back to Approval Page.
![comment in approval](https://github.com/Decoder-Paul/ServiceNow-Development/blob/master/Approval%20Comment%20Redirection/Comment%20from%20Approval.PNG)
