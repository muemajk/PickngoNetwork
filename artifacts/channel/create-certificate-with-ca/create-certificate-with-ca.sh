createcertificatesForOrg1() {
  echo
  echo "Enroll the CA admin"
  echo
  mkdir -p crypto-config-ca/peerOrganizations/org1.pickngo.com/
  export FABRIC_CA_CLIENT_HOME=${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/

   
  fabric-ca-client enroll -u https://admin:adminpw@localhost:7054 --caname ca.org1.pickngo.com --tls.certfiles ${PWD}/fabric-ca/org1/tls-cert.pem
   

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-org1-pickngo-com.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-org1-pickngo-com.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-org1-pickngo-com.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-org1-pickngo-com.pem
    OrganizationalUnitIdentifier: orderer' >${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/msp/config.yaml

  echo
  echo "Register peer0"
  echo
  fabric-ca-client register --caname ca.org1.pickngo.com --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles ${PWD}/fabric-ca/org1/tls-cert.pem

  echo
  echo "Register peer1"
  echo
  fabric-ca-client register --caname ca.org1.pickngo.com --id.name peer1 --id.secret peer1pw --id.type peer --tls.certfiles ${PWD}/fabric-ca/org1/tls-cert.pem

  echo
  echo "Register user"
  echo
  fabric-ca-client register --caname ca.org1.pickngo.com --id.name user1 --id.secret user1pw --id.type client --tls.certfiles ${PWD}/fabric-ca/org1/tls-cert.pem

  echo
  echo "Register the org admin"
  echo
  fabric-ca-client register --caname ca.org1.pickngo.com --id.name org1admin --id.secret org1adminpw --id.type admin --tls.certfiles ${PWD}/fabric-ca/org1/tls-cert.pem

  mkdir -p crypto-config-ca/peerOrganizations/org1.pickngo.com/peers

  # -----------------------------------------------------------------------------------
  #  Peer 0
  mkdir -p crypto-config-ca/peerOrganizations/org1.pickngo.com/peers/peer0.org1.pickngo.com

  echo
  echo "## Generate the peer0 msp"
  echo
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:7054 --caname ca.org1.pickngo.com -M ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/peers/peer0.org1.pickngo.com/msp --csr.hosts peer0.org1.pickngo.com --tls.certfiles ${PWD}/fabric-ca/org1/tls-cert.pem

  cp ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/msp/config.yaml ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/peers/peer0.org1.pickngo.com/msp/config.yaml

  echo
  echo "## Generate the peer0-tls certificates"
  echo
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:7054 --caname ca.org1.pickngo.com -M ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/peers/peer0.org1.pickngo.com/tls --enrollment.profile tls --csr.hosts peer0.org1.pickngo.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/org1/tls-cert.pem

  cp ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/peers/peer0.org1.pickngo.com/tls/tlscacerts/* ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/peers/peer0.org1.pickngo.com/tls/ca.crt
  cp ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/peers/peer0.org1.pickngo.com/tls/signcerts/* ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/peers/peer0.org1.pickngo.com/tls/server.crt
  cp ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/peers/peer0.org1.pickngo.com/tls/keystore/* ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/peers/peer0.org1.pickngo.com/tls/server.key

  mkdir ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/msp/tlscacerts
  cp ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/peers/peer0.org1.pickngo.com/tls/tlscacerts/* ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/msp/tlscacerts/ca.crt

  mkdir ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/tlsca
  cp ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/peers/peer0.org1.pickngo.com/tls/tlscacerts/* ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/tlsca/tlsca.org1.pickngo.com-cert.pem

  mkdir ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/ca
  cp ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/peers/peer0.org1.pickngo.com/msp/cacerts/* ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/ca/ca.org1.pickngo.com-cert.pem

  # ------------------------------------------------------------------------------------------------

  # Peer1

  mkdir -p crypto-config-ca/peerOrganizations/org1.pickngo.com/peers/peer1.org1.pickngo.com

  echo
  echo "## Generate the peer1 msp"
  echo
  fabric-ca-client enroll -u https://peer1:peer1pw@localhost:7054 --caname ca.org1.pickngo.com -M ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/peers/peer1.org1.pickngo.com/msp --csr.hosts peer1.org1.pickngo.com --tls.certfiles ${PWD}/fabric-ca/org1/tls-cert.pem

  cp ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/msp/config.yaml ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/peers/peer1.org1.pickngo.com/msp/config.yaml

  echo
  echo "## Generate the peer1-tls certificates"
  echo
  fabric-ca-client enroll -u https://peer1:peer1pw@localhost:7054 --caname ca.org1.pickngo.com -M ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/peers/peer1.org1.pickngo.com/tls --enrollment.profile tls --csr.hosts peer1.org1.pickngo.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/org1/tls-cert.pem

  cp ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/peers/peer1.org1.pickngo.com/tls/tlscacerts/* ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/peers/peer1.org1.pickngo.com/tls/ca.crt
  cp ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/peers/peer1.org1.pickngo.com/tls/signcerts/* ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/peers/peer1.org1.pickngo.com/tls/server.crt
  cp ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/peers/peer1.org1.pickngo.com/tls/keystore/* ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/peers/peer1.org1.pickngo.com/tls/server.key

  # --------------------------------------------------------------------------------------------------

  mkdir -p crypto-config-ca/peerOrganizations/org1.pickngo.com/users
  mkdir -p crypto-config-ca/peerOrganizations/org1.pickngo.com/users/User1@org1.pickngo.com

  echo
  echo "## Generate the user msp"
  echo
  fabric-ca-client enroll -u https://user1:user1pw@localhost:7054 --caname ca.org1.pickngo.com -M ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/users/User1@org1.pickngo.com/msp --tls.certfiles ${PWD}/fabric-ca/org1/tls-cert.pem

  mkdir -p crypto-config-ca/peerOrganizations/org1.pickngo.com/users/Admin@org1.pickngo.com

  echo
  echo "## Generate the org admin msp"
  echo
  fabric-ca-client enroll -u https://org1admin:org1adminpw@localhost:7054 --caname ca.org1.pickngo.com -M ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/users/Admin@org1.pickngo.com/msp --tls.certfiles ${PWD}/fabric-ca/org1/tls-cert.pem

  cp ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/msp/config.yaml ${PWD}/crypto-config-ca/peerOrganizations/org1.pickngo.com/users/Admin@org1.pickngo.com/msp/config.yaml

}

# createcertificatesForOrg1

createCertificateForOrg2() {
  echo
  echo "Enroll the CA admin"
  echo
  mkdir -p /crypto-config-ca/peerOrganizations/org2.pickngo.com/

  export FABRIC_CA_CLIENT_HOME=${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/

   
  fabric-ca-client enroll -u https://admin:adminpw@localhost:8054 --caname ca.org2.pickngo.com --tls.certfiles ${PWD}/fabric-ca/org2/tls-cert.pem
   

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-org2-pickngo-com.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-org2-pickngo-com.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-org2-pickngo-com.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-org2-pickngo-com.pem
    OrganizationalUnitIdentifier: orderer' >${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/msp/config.yaml

  echo
  echo "Register peer0"
  echo
   
  fabric-ca-client register --caname ca.org2.pickngo.com --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles ${PWD}/fabric-ca/org2/tls-cert.pem
   

  echo
  echo "Register peer1"
  echo
   
  fabric-ca-client register --caname ca.org2.pickngo.com --id.name peer1 --id.secret peer1pw --id.type peer --tls.certfiles ${PWD}/fabric-ca/org2/tls-cert.pem
   

  echo
  echo "Register user"
  echo
   
  fabric-ca-client register --caname ca.org2.pickngo.com --id.name user1 --id.secret user1pw --id.type client --tls.certfiles ${PWD}/fabric-ca/org2/tls-cert.pem
   

  echo
  echo "Register the org admin"
  echo
   
  fabric-ca-client register --caname ca.org2.pickngo.com --id.name org2admin --id.secret org2adminpw --id.type admin --tls.certfiles ${PWD}/fabric-ca/org2/tls-cert.pem
   

  mkdir -p crypto-config-ca/peerOrganizations/org2.pickngo.com/peers
  mkdir -p crypto-config-ca/peerOrganizations/org2.pickngo.com/peers/peer0.org2.pickngo.com

  # --------------------------------------------------------------
  # Peer 0
  echo
  echo "## Generate the peer0 msp"
  echo
   
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:8054 --caname ca.org2.pickngo.com -M ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/peers/peer0.org2.pickngo.com/msp --csr.hosts peer0.org2.pickngo.com --tls.certfiles ${PWD}/fabric-ca/org2/tls-cert.pem
   

  cp ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/msp/config.yaml ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/peers/peer0.org2.pickngo.com/msp/config.yaml

  echo
  echo "## Generate the peer0-tls certificates"
  echo
   
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:8054 --caname ca.org2.pickngo.com -M ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/peers/peer0.org2.pickngo.com/tls --enrollment.profile tls --csr.hosts peer0.org2.pickngo.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/org2/tls-cert.pem
   

  cp ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/peers/peer0.org2.pickngo.com/tls/tlscacerts/* ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/peers/peer0.org2.pickngo.com/tls/ca.crt
  cp ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/peers/peer0.org2.pickngo.com/tls/signcerts/* ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/peers/peer0.org2.pickngo.com/tls/server.crt
  cp ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/peers/peer0.org2.pickngo.com/tls/keystore/* ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/peers/peer0.org2.pickngo.com/tls/server.key

  mkdir ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/msp/tlscacerts
  cp ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/peers/peer0.org2.pickngo.com/tls/tlscacerts/* ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/msp/tlscacerts/ca.crt

  mkdir ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/tlsca
  cp ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/peers/peer0.org2.pickngo.com/tls/tlscacerts/* ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/tlsca/tlsca.org2.pickngo.com-cert.pem

  mkdir ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/ca
  cp ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/peers/peer0.org2.pickngo.com/msp/cacerts/* ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/ca/ca.org2.pickngo.com-cert.pem

  # --------------------------------------------------------------------------------
  #  Peer 1
  echo
  echo "## Generate the peer1 msp"
  echo
   
  fabric-ca-client enroll -u https://peer1:peer1pw@localhost:8054 --caname ca.org2.pickngo.com -M ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/peers/peer1.org2.pickngo.com/msp --csr.hosts peer1.org2.pickngo.com --tls.certfiles ${PWD}/fabric-ca/org2/tls-cert.pem
   

  cp ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/msp/config.yaml ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/peers/peer1.org2.pickngo.com/msp/config.yaml

  echo
  echo "## Generate the peer1-tls certificates"
  echo
   
  fabric-ca-client enroll -u https://peer1:peer1pw@localhost:8054 --caname ca.org2.pickngo.com -M ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/peers/peer1.org2.pickngo.com/tls --enrollment.profile tls --csr.hosts peer1.org2.pickngo.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/org2/tls-cert.pem
   

  cp ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/peers/peer1.org2.pickngo.com/tls/tlscacerts/* ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/peers/peer1.org2.pickngo.com/tls/ca.crt
  cp ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/peers/peer1.org2.pickngo.com/tls/signcerts/* ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/peers/peer1.org2.pickngo.com/tls/server.crt
  cp ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/peers/peer1.org2.pickngo.com/tls/keystore/* ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/peers/peer1.org2.pickngo.com/tls/server.key
  # -----------------------------------------------------------------------------------

  mkdir -p crypto-config-ca/peerOrganizations/org2.pickngo.com/users
  mkdir -p crypto-config-ca/peerOrganizations/org2.pickngo.com/users/User1@org2.pickngo.com

  echo
  echo "## Generate the user msp"
  echo
   
  fabric-ca-client enroll -u https://user1:user1pw@localhost:8054 --caname ca.org2.pickngo.com -M ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/users/User1@org2.pickngo.com/msp --tls.certfiles ${PWD}/fabric-ca/org2/tls-cert.pem
   

  mkdir -p crypto-config-ca/peerOrganizations/org2.pickngo.com/users/Admin@org2.pickngo.com

  echo
  echo "## Generate the org admin msp"
  echo
   
  fabric-ca-client enroll -u https://org2admin:org2adminpw@localhost:8054 --caname ca.org2.pickngo.com -M ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/users/Admin@org2.pickngo.com/msp --tls.certfiles ${PWD}/fabric-ca/org2/tls-cert.pem
   

  cp ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/msp/config.yaml ${PWD}/crypto-config-ca/peerOrganizations/org2.pickngo.com/users/Admin@org2.pickngo.com/msp/config.yaml

}

# createCertificateForOrg2

createCretificateForOrderer() {
  echo
  echo "Enroll the CA admin"
  echo
  mkdir -p crypto-config-ca/ordererOrganizations/pickngo.com

  export FABRIC_CA_CLIENT_HOME=${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com

   
  fabric-ca-client enroll -u https://admin:adminpw@localhost:9054 --caname ca-orderer --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-orderer.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-orderer.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-orderer.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-orderer.pem
    OrganizationalUnitIdentifier: orderer' >${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/msp/config.yaml

  echo
  echo "Register orderer"
  echo
   
  fabric-ca-client register --caname ca-orderer --id.name orderer --id.secret ordererpw --id.type orderer --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  echo
  echo "Register orderer2"
  echo
   
  fabric-ca-client register --caname ca-orderer --id.name orderer2 --id.secret ordererpw --id.type orderer --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  echo
  echo "Register orderer3"
  echo
   
  fabric-ca-client register --caname ca-orderer --id.name orderer3 --id.secret ordererpw --id.type orderer --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  echo
  echo "Register the orderer admin"
  echo
   
  fabric-ca-client register --caname ca-orderer --id.name ordererAdmin --id.secret ordererAdminpw --id.type admin --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  mkdir -p crypto-config-ca/ordererOrganizations/pickngo.com/orderers
  # mkdir -p crypto-config-ca/ordererOrganizations/pickngo.com/orderers/pickngo.com

  # ---------------------------------------------------------------------------
  #  Orderer

  mkdir -p crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer.pickngo.com

  echo
  echo "## Generate the orderer msp"
  echo
   
  fabric-ca-client enroll -u https://orderer:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer.pickngo.com/msp --csr.hosts orderer.pickngo.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  cp ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/msp/config.yaml ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer.pickngo.com/msp/config.yaml

  echo
  echo "## Generate the orderer-tls certificates"
  echo
   
  fabric-ca-client enroll -u https://orderer:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer.pickngo.com/tls --enrollment.profile tls --csr.hosts orderer.pickngo.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  cp ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer.pickngo.com/tls/tlscacerts/* ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer.pickngo.com/tls/ca.crt
  cp ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer.pickngo.com/tls/signcerts/* ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer.pickngo.com/tls/server.crt
  cp ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer.pickngo.com/tls/keystore/* ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer.pickngo.com/tls/server.key

  mkdir ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer.pickngo.com/msp/tlscacerts
  cp ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer.pickngo.com/tls/tlscacerts/* ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer.pickngo.com/msp/tlscacerts/tlsca.pickngo.com-cert.pem

  mkdir ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/msp/tlscacerts
  cp ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer.pickngo.com/tls/tlscacerts/* ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/msp/tlscacerts/tlsca.pickngo.com-cert.pem

  # -----------------------------------------------------------------------
  #  Orderer 2

  mkdir -p crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer2.pickngo.com

  echo
  echo "## Generate the orderer msp"
  echo
   
  fabric-ca-client enroll -u https://orderer2:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer2.pickngo.com/msp --csr.hosts orderer2.pickngo.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  cp ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/msp/config.yaml ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer2.pickngo.com/msp/config.yaml

  echo
  echo "## Generate the orderer-tls certificates"
  echo
   
  fabric-ca-client enroll -u https://orderer2:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer2.pickngo.com/tls --enrollment.profile tls --csr.hosts orderer2.pickngo.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  cp ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer2.pickngo.com/tls/tlscacerts/* ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer2.pickngo.com/tls/ca.crt
  cp ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer2.pickngo.com/tls/signcerts/* ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer2.pickngo.com/tls/server.crt
  cp ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer2.pickngo.com/tls/keystore/* ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer2.pickngo.com/tls/server.key

  mkdir ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer2.pickngo.com/msp/tlscacerts
  cp ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer2.pickngo.com/tls/tlscacerts/* ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer2.pickngo.com/msp/tlscacerts/tlsca.pickngo.com-cert.pem

  # mkdir ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/msp/tlscacerts
  # cp ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer2.pickngo.com/tls/tlscacerts/* ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/msp/tlscacerts/tlsca.pickngo.com-cert.pem

  # ---------------------------------------------------------------------------
  #  Orderer 3
  mkdir -p crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer3.pickngo.com

  echo
  echo "## Generate the orderer msp"
  echo
   
  fabric-ca-client enroll -u https://orderer3:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer3.pickngo.com/msp --csr.hosts orderer3.pickngo.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  cp ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/msp/config.yaml ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer3.pickngo.com/msp/config.yaml

  echo
  echo "## Generate the orderer-tls certificates"
  echo
   
  fabric-ca-client enroll -u https://orderer3:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer3.pickngo.com/tls --enrollment.profile tls --csr.hosts orderer3.pickngo.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  cp ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer3.pickngo.com/tls/tlscacerts/* ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer3.pickngo.com/tls/ca.crt
  cp ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer3.pickngo.com/tls/signcerts/* ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer3.pickngo.com/tls/server.crt
  cp ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer3.pickngo.com/tls/keystore/* ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer3.pickngo.com/tls/server.key

  mkdir ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer3.pickngo.com/msp/tlscacerts
  cp ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer3.pickngo.com/tls/tlscacerts/* ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer3.pickngo.com/msp/tlscacerts/tlsca.pickngo.com-cert.pem

  # mkdir ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/msp/tlscacerts
  # cp ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/orderers/orderer3.pickngo.com/tls/tlscacerts/* ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/msp/tlscacerts/tlsca.pickngo.com-cert.pem

  # ---------------------------------------------------------------------------

  mkdir -p crypto-config-ca/ordererOrganizations/pickngo.com/users
  mkdir -p crypto-config-ca/ordererOrganizations/pickngo.com/users/Admin@pickngo.com

  echo
  echo "## Generate the admin msp"
  echo
   
  fabric-ca-client enroll -u https://ordererAdmin:ordererAdminpw@localhost:9054 --caname ca-orderer -M ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/users/Admin@pickngo.com/msp --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  cp ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/msp/config.yaml ${PWD}/crypto-config-ca/ordererOrganizations/pickngo.com/users/Admin@pickngo.com/msp/config.yaml

}

# createCretificateForOrderer

sudo rm -rf crypto-config-ca/*
# sudo rm -rf fabric-ca/*
createcertificatesForOrg1
createCertificateForOrg2
createCretificateForOrderer

