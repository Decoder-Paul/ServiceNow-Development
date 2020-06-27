# Usage of Session Data as a Global Variable
It can be used as a global variable without permanently storing it anywhere but on session level for temporary purpose.
## Example Usecase
-> On click of a UI Action of a form 
-> a form data can be put into the Session object 
-> which is stored on Server as long as the Session is active 
-> that session Object then can be used anywhere within the instance 
-> or Any client script can make an AJAX call to get the data & use it on client side form before submission
##### In the following example Opened For value is being passed from Interaction form to a Catalog Item's Requested For variable
#### Interaction form
![Interaction form](Interaction%20fields.PNG)
#### JSON Data
![JSON Data](JSON%20data.PNG)
#### Requested for
![Catalog Item Form](catItem%20Fields.PNG)