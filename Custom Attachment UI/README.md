# RITM Attachments on SC Task & Approval

In general the RITM & Approval attachments are shown as Embedded List on SC Task

In order to show All the Attachments at same place I have come up with this **DOM manipulation** approach. It will show RITM and Approval Attachment along with the the attachments that we will add on the form (managed attachments).

This way we don't need to copy attachments from one table to another table in order to show them altogether which saves us from creating Data Redundancy on `sys_attachment` table.

#### RITM Attachments on UI16 Approval
![RITM Attachments on Approval](https://github.com/Decoder-Paul/ServiceNow-Development/blob/master/Custom%20Attachment%20UI/RITM%20Attachments%20on%20UI16%20Approval.PNG)

#### RITM Attachments on SC Task
![RITM Attachments on SC Task](https://github.com/Decoder-Paul/ServiceNow-Development/blob/master/Custom%20Attachment%20UI/All%20Attachments%20on%20SC%20Task.PNG)

#### RITM Attachment on Portal Approval Form
![RITM Attachments on Portal Approval Form](https://github.com/Decoder-Paul/ServiceNow-Development/blob/master/Custom%20Attachment%20UI/RITM%20Attachment%20on%20Portal%20Approval%20Form.png)
