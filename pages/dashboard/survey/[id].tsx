import React, { FunctionComponent, useState, useEffect } from "react";
import Layout from "../../../components/layout/Layout";
import {
  Tabs,
  Breadcrumb,
  BackTop,
  Row,
  Col,
  Button,
  Alert,
  Tooltip,
} from "antd";
import { Survey, SurveyStatus } from "../../../models/survey";
import { getSurvey } from "../../../apis/survey";
import SurveyViewer from "../../../components/survey/SurveyViewer";
import ReportViewer from "../../../components/survey/report/ReportViewer";
import { useRouter } from "next/router";
import { useAuth0 } from "@auth0/auth0-react";
import Link from "next/link";
import { withAuthenticationRequired } from "@auth0/auth0-react";

const { TabPane } = Tabs;

interface Props {}

const ManageSurveyPage: FunctionComponent<Props> = () => {
  const { getAccessTokenSilently } = useAuth0();

  const router = useRouter();
  const surveyId = router.query.id as string;

  const [loading, setLoading] = useState(true);
  const [survey, setSurvey] = useState<Survey>(undefined);
  const [errorMessage, setErrorMessage] = useState<string>(undefined);

  useEffect(() => {
    if (router.asPath !== router.route) {
      const fetchSurvey = async () => {
        const accessToken = await getAccessTokenSilently();
        const result = await getSurvey(surveyId, accessToken);

        if (result.isError) {
          setErrorMessage(result.error.message);
        } else {
          setSurvey(result.survey);
        }

        setLoading(false);
      };
      fetchSurvey();
    }
  }, [router]);

  const renderTakeSurveyButton = () => {
    if (survey.status !== SurveyStatus.PUBLISHED) {
      return;
    }
    return (
      <Link href={`/survey/${surveyId}`}>
        <Tooltip
          placement="topLeft"
          title="Take the survey as a participant. You'll be redirected to take the survey."
          arrowPointAtCenter
        >
          <Button style={{ marginRight: "0.8rem" }}>Take the survey</Button>
        </Tooltip>
      </Link>
    );
  };

  const renderActionButton = () => {
    console.log("status", survey.status);
    if (survey.status == null) {
      return;
    }
    switch (survey.status) {
      case SurveyStatus.PUBLISHED:
        return <Button danger>Unpublish</Button>;
      case SurveyStatus.UNPUBLISHED:
        return (
          <>
            <Button style={{ marginRight: "0.8rem" }} type="primary">
              Publish
            </Button>
            <Button danger>Delete</Button>
          </>
        );
    }
  };

  return (
    <>
      <Layout title="Manage Survey">
        {loading ? (
          <div></div>
        ) : !!errorMessage ? (
          <Alert
            message="Failed to load page. Please refresh to try again."
            type="error"
          ></Alert>
        ) : (
          survey && (
            <>
              <Breadcrumb>
                <Breadcrumb.Item>
                  <a href="/">Home</a>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  <a href="/dashboard">Dashboard</a>
                </Breadcrumb.Item>
                <Breadcrumb.Item>{survey.surveyTitle}</Breadcrumb.Item>
              </Breadcrumb>
              <Row justify="space-between" align="bottom">
                <Col>
                  <p className="secondary-title">{survey.surveyTitle}</p>
                </Col>
                <Col style={{ float: "right" }}>
                  {renderTakeSurveyButton()}
                  {renderActionButton()}
                </Col>
              </Row>
              <Tabs
                defaultActiveKey="1"
                centered
                style={{ paddingTop: "1.5rem" }}
              >
                <TabPane tab="Questions" key="1">
                  <BackTop></BackTop>
                  <SurveyViewer surveyId={surveyId} preview></SurveyViewer>
                </TabPane>
                <TabPane tab="Responses Report" key="2">
                  <BackTop></BackTop>
                  <ReportViewer surveyId={surveyId}></ReportViewer>
                </TabPane>
              </Tabs>
            </>
          )
        )}
      </Layout>
    </>
  );
};

export default withAuthenticationRequired(ManageSurveyPage);
