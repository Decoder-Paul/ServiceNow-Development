# RITM Attachments on SC Task & Approval

In general the RITM & Approval attachments are shown as Embedded List on SC Task

In order to show All the Attachments at same place I have come up with this **DOM manipulation** approach. It will show RITM and Approval Attachment along with the the attachments that we will add on the form (managed attachments).

This way we don't need to copy attachments from one table to another table in order to show them altogether which saves us from creating Data Redundancy on `sys_attachment` table.

#### RITM Attachments on UI16 Approval
![RITM Attachments on Approval](Custom Attachment UI\RITM Attachments on UI16 Approval.PNG)

#### RITM Attachments on SC Task
![RITM Attachments on SC Task](Custom Attachment UI\All Attachments on SC Task.PNG)
