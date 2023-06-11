<?php
	$inData = getRequestInfo();

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
		if ($conn->connect_error) 
		{
			returnWithError( $conn->connect_error );
			exit();
		} 

	$newFirstName = $inData["FirstName"];
	$newLastName = $inData["LastName"];
	$Phone = $inData["Phone"];
	$Email = $inData["Email"];
	$userID = validateUser($_COOKIE["login"], $_COOKIE["password"], $conn);

	if(!(filter_var($Email, FILTER_VALIDATE_EMAIL))) {
		returnWithError("Email format is invalid, EX: name@example.com");
		exit();
	}

	if(!(isValidTelephoneNumber($Phone))) {
		returnWithError("Phone Number Invalid. Use xxx-xxx-xxxx");
		exit();
	}

	if(contactExists($newFirstName, $newLastName, $conn) == true)
	{
		exit();
	}
		$stmt = $conn->prepare("insert into Contacts (FirstName,LastName,Phone,Email, UserID) VALUES(?, ?, ?, ?, ?)");
		$stmt->bind_param('ssssi', $newFirstName, $newLastName, $Phone, $Email, $userID);
		$stmt->execute();
		$stmt->close();
		$conn->close();
		returnWithInfo("Contact Added");
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

	function contactExists( $firstName, $lastName, $conn )
	{
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

	function validateUser($userLogin, $password, $conn) 
	{
		$stmt=$conn->prepare("select ID from Users where Login = ? and Password = ?");
		$stmt->bind_param("ss", $userLogin, $password);
		$stmt->execute();
		$res = $stmt->get_result();
		
		if( $row = $res->fetch_assoc()  )
		{
			return $row['ID'];
		}
		else
		{
			returnWithError("No Records Found");
			exit();
		}
		
	}

	function isValidTelephoneNumber($phone) {
    	if(preg_match('/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/', $phone)) {
			return true;
		} 
		else {
			return false;
		}
	}

	function returnWithInfo( $val )
	{
		$retValue = '{"Status":"' . $val . '"}';
		sendResultInfoAsJson( $retValue );
	}

	
?>