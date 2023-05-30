<?php
	$inData = getRequestInfo();

	$userLogin = $inData["userLogin"];
	$userPass = $inData["userPass"];
	$firstName = $inData["firstName"];
	$lastName = $inData["lastName"];

	if(userExists($userLogin) == true)
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
			$stmt = $conn->prepare("INSERT into Users (FirstName,LastName,Login,Password) VALUES(?, ?, ?, ?)");
			$stmt->bind_param('ssss', $firstName, $lastName, $userLogin, $userPass);
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

	function userExists( $userID )
	{
		$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
		$stmt=$conn->prepare("select * from Users where Login=?");
		$stmt->bind_param("s", $userID);
		$stmt->execute();
		$res = $stmt->get_result();
		$num = mysqli_num_rows($res);
		if($num > 0) {
			returnWithError("User aready exists.");
			return true;
		}
		else {return false;}
	}
	
?>
