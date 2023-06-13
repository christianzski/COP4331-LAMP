<?php
	$inData = getRequestInfo();
	
	$id = $inData["ID"];
	$userId = $inData["userID"];
  $idCheck = 0;

	$conn = new mysqli("localhost", "Group21", "Group21OnTop", "COP4331");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
    $idCheck = validUser($conn);
	  if($idCheck == 0){
        returnWithError( "User not valid within cookie" );
    }
         
		$stmt = $conn->prepare("delete From Contacts where (UserId = ? and id = ?)");
		$stmt->bind_param("ii", $idCheck, $id);
		$stmt->execute();
		$stmt->close();
		$conn->close();
		returnWithError("");
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
 
	function validUser($conn) //todo here ---> login = PoonP, password = testing
	{
	    $stmt = $conn->prepare("SELECT ID,firstName,lastName FROM Users WHERE Login=? AND Password =?");
        $stmt->bind_param("ss", $_COOKIE["login"], $_COOKIE["password"]);
        $stmt->execute();
        $result = $stmt->get_result();

        if( $row = $result->fetch_assoc()  )
        {
            $idCheck = $row['ID'];
        }

        return $idCheck;
	}
?>