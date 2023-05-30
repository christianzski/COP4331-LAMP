<?php
	$inData = getRequestInfo();
	
	$newFirstName = $inData["FirstName"];
    $newLastName = ['LastName'];
    $newPhone = ["Phone"];
    $newEmail = ["Email"];
    $userID = ["UserID"];

	if(contactExists($newFirstName, $newLastName) == true)
	{

	}
		
	else{
		$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
		if ($conn->connect_error) 
		{
			returnWithError( $conn->connect_error );
		} 
		else
		{
			$stmt = $conn->prepare("INSERT into Contacts (FirstName,LastName,Phone,Email, UserID) VALUES(?, ?, ?, ?, ?)");
			$stmt->bind_param('ssssi', $newFirstName, $newLastName, $newPhone, $newEmail, $userID);
			$stmt->execute();
			echo("This works");
			$stmt->close();
			$conn->close();
			returnWithError("");
		}
	}
	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}

	function contactExists( $firstName, $lastName )
	{
		$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
		$stmt=$conn->prepare("select * from Contacts where FirstName=? and LastName = ?");
		$stmt->bind_param("ss", $firstName, $lastName);
		$stmt->execute();
		$res = $stmt->get_result();
		$num = mysqli_num_rows($res);
		if($num > 0) {
			returnWithError("Contact aready exists.");
			return true;
		}
		else {return false;}
	}
	
?>
