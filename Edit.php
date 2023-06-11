<?php
	$inData = getRequestInfo();
	
	$UserID= validateUser($_COOKIE["login"], $_COOKIE["password"]);
		
	{
		$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
		if ($conn->connect_error) 
		{
			returnWithError( $conn->connect_error );
			exit();
		} 

		$Email = $inData["Email"];
		$Phone = $inData["Phone"];

		if(!(filter_var($Email, FILTER_VALIDATE_EMAIL))) {
			returnWithError("Email format is invalid, EX: name@example.com");
			exit();
		}

		if(!(isValidTelephoneNumber($Phone))) {
			returnWithError("Phone Number Invalid. Use xxx-xxx-xxxx");
			exit();
		}

		$stmt = $conn->prepare("update Contacts set FirstName = ?, LastName = ?, Phone = ?, Email = ? where (UserID = ? and ID = ?)");
		$stmt->bind_param('ssssii', $inData["FirstName"], $inData["LastName"], $Phone, $Email, $UserID, $inData["ID"]);
		$stmt->execute();
		$stmt->close();
		$conn->close();
		returnWithInfo("Contact Updated");
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
 
  function validateUser($userLogin, $password) 
	{
		$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
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

	function returnWithInfo( $val )
	{
		$retValue = '{"Status":"' . $val . '"}';
		sendResultInfoAsJson( $retValue );
	}

	function isValidTelephoneNumber($phone) {
    	if(preg_match('/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/', $phone)) {
			return true;
		} 
		else {
			return false;
		}
	}
	
?>
